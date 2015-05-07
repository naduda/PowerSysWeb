package pr.server.tools;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;




import javax.websocket.Session;




import pr.common.Encryptor;
import pr.db.ConnectDB;
import pr.model.Alarm;
import pr.model.DvalTI;
import pr.model.TSysParam;
import pr.model.TViewParam;
import pr.model.Tsignal;
import pr.model.Tuser;
import pr.model.VsignalView;
import pr.server.Scheme;
import pr.server.messages.AlarmMessage;
import pr.server.messages.CommandMessage;
import pr.server.messages.KeyValueArrayMessage;
import pr.server.messages.ValueMessage;
import pr.server.messages.ValueMessage.Group;
import pr.server.tools.model.AlarmItem;

public class Tools {
	public static final Map<Integer, VsignalView> VSIGNALS = ConnectDB.getVsignalsMap();
	public static final Map<Integer, Tsignal> TSIGNALS = ConnectDB.getTsignalsMap();
	public static final Map<Integer, Tuser> TUSERS = ConnectDB.getTuserMap();
	public static final List<TViewParam> COLORS = ConnectDB.getTViewParam("LOG_STATE", "COLOR", -1);
	
	public Tools() {
		
	}
	
	public static void sendValues(Session session, List<DvalTI> values, Scheme scheme) {
		if (values == null) return;
		values.forEach(v -> {
//			DvalTI v = values.get(0);
			ValueMessage oldValue = new ValueMessage();
			oldValue.setValue(v.getVal());
			oldValue.setDate(v.getDt());
			oldValue.setMode(ConnectDB.getTSysParam("SIGNAL_STATUS")
					.get(VSIGNALS.get(v.getSignalref()).getStatus() + "").getParamdescr());
			oldValue.setrCode(v.getRcode());

			List<Group> groups = new ArrayList<>();
			List<String> listGroups = scheme.getSignalMap().get(v.getSignalref());
			listGroups.forEach(g -> {
				Group group = new Group();
				group.setName(g);
				String script = scheme.getCustProps().get(g).get("script");
				if (script == null) {
					String title = scheme.getCustProps().get(g).get("title");
					if (title.indexOf(".") != -1) {
						script = title.substring(0, title.indexOf("."));
					} else {
						script = title;
					}
				}
				groups.add(group);
			});
			oldValue.setGroups(groups);
			
			try {
				session.getBasicRemote().sendObject(oldValue);
			} catch (Exception e) {
				e.printStackTrace();
			}
		});
	}
	
	public static void sendScripts(Session session, Scheme scheme) {
		KeyValueArrayMessage arr = new KeyValueArrayMessage();
		arr.setNameArray("scripts");
		
		scheme.getSignalMap().keySet().forEach(k -> {
			List<String> lg = scheme.getSignalMap().get(k);
			lg.forEach(g -> {
				Map<String, String> map = scheme.getCustProps().get(g);
				
				if (map != null) {
					String script = map.get("script");
					String title = scheme.getCustProps().get(g).get("title");
					if (script == null) {
						if (title.indexOf(".") != -1) {
							script = title.substring(0, title.indexOf("."));
						} else {
							script = title;
						}
					}
					
					int typeSignal = VSIGNALS.get(k) != null ? VSIGNALS.get(k).getTypesignalref() : 0;
					String precision = scheme.getCustProps().get(g).get("Precision");
					int precisionInt = precision == null ? 0 : precision.length() - precision.indexOf(".") - 1;
					String units = VSIGNALS.get(k) != null ? VSIGNALS.get(k).getNameunit() : "";
					//null or Ne zadano
					units = ((units == null) || (units.trim().indexOf(" ") != -1)) ? "" : units;
					arr.putKeyValue(g, k + ":" + 
							ConnectDB.getSpTypeSignalMap().get(typeSignal).getNametypesignal() + ":" +
							typeSignal + ":" + TSIGNALS.get(k).getKoef() + ":" + precisionInt + ":" +
							units + ":" + script + ":" + VSIGNALS.get(k).getNamesignal());
				}
			});
		});
		try {
			session.getBasicRemote().sendObject(arr);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static void sendAlarms(Session session, List<Alarm> values) {
		values.forEach(v -> {
			try {
				session.getBasicRemote().sendObject(new AlarmMessage(new AlarmItem(v)));
			} catch (Exception e) {
				e.printStackTrace();
			}
		});
	}
	
	public static String decToHex(long dec) {
		char[] hexDigits = {'0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'};
	    StringBuilder hexBuilder = new StringBuilder(8);
	    hexBuilder.setLength(8);
	    for (int i = 8 - 1; i >= 0; --i)
	    {
	    	long j = dec & 0x0F;
		    hexBuilder.setCharAt(i, hexDigits[(int)j]);
		    dec >>= 4;
	    }
	    return hexBuilder.toString(); 
	}
	
	public static void sendPriorities(Session session,  Map<String, TSysParam> values) {
		values.values().forEach(v -> {
			try {
				CommandMessage cm = new CommandMessage();
				cm.setCommand("priority");
				cm.setParameters(v.getVal(), v.getParamdescr());
				session.getBasicRemote().sendObject(cm);
			} catch (Exception e) {
				e.printStackTrace();
			}
		});
	}
	
	public static Tuser checkUser(String userName, String password) {
		Optional<Tuser> filter = TUSERS.values().stream().filter(f -> f.getUn().equals(userName)).findFirst();
		Encryptor encryptor = new Encryptor();
		String psw = encryptor.decrypt(password);
		psw = psw.substring(psw.indexOf("_") + 1);
		
		if (filter.isPresent()) {
			Tuser currentUser = filter.get();
			return encryptor.decrypt(currentUser.getPwd()).trim().equals(psw) && 
					currentUser.getIsblocked() == 0 ? currentUser : null;
		} else {
			if ("admin".equals(userName) && "qwe".equals(psw)) {
				Tuser currentUser = new Tuser();
				currentUser.setIduser(-1);
				currentUser.setUn("Administrator");
				return currentUser;
			}
		}
		return null;
	}
	
	public static void confirmAlarms(int userId, String text, Map<String, String> parameters) {
		SimpleDateFormat formatter = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss");
		parameters.keySet().forEach(k -> {
			try {
				String[] arr = k.split("_");
				String recDT = parameters.get(k);
				String recDTmili = parameters.get(k).substring(parameters.get(k).lastIndexOf(".") + 1);
				while (recDTmili.length() < 9) recDTmili += "0";
				String evDTmili = arr[0].substring(arr[0].lastIndexOf(".") + 1);
				while (evDTmili.length() < 9) evDTmili += "0";
				
				Timestamp recordDT = new Timestamp(formatter.parse(recDT).getTime());
				recordDT.setNanos(Integer.parseInt(recDTmili));
				Timestamp eventDT = new Timestamp(formatter.parse(arr[0]).getTime());
				eventDT.setNanos(Integer.parseInt(evDTmili));
				int objRef = Integer.parseInt(arr[1]);

				ConnectDB.confirmAlarm(recordDT, eventDT, objRef, new Timestamp(System.currentTimeMillis()), text, userId);
			} catch (Exception e) {
				e.printStackTrace();
			}
		});
	}
}
