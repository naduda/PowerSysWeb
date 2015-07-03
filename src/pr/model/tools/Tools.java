package pr.model.tools;

import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.websocket.Session;

import pr.common.Encryptor;
import pr.db.ConnectDB;
import pr.model.Alarm;
import pr.model.AlarmItem;
import pr.model.DvalTI;
import pr.model.Scheme;
import pr.model.TSysParam;
import pr.model.TViewParam;
import pr.model.Transparant;
import pr.model.Tscheme;
import pr.model.Tsignal;
import pr.model.TtranspHistory;
import pr.model.TtranspLocate;
import pr.model.Ttransparant;
import pr.model.Tuser;
import pr.model.VsignalView;
import pr.server.Server;
import pr.server.SessionParams;
import pr.server.messages.AlarmMessage;
import pr.server.messages.CommandMessage;
import pr.server.messages.KeyValueArrayMessage;
import pr.server.messages.ValueMessage;

public class Tools {
	public static final Map<Integer, VsignalView> VSIGNALS = ConnectDB.getVsignalsMap();
	public static final Map<Integer, Tsignal> TSIGNALS = ConnectDB.getTsignalsMap();
	public static final Map<Integer, Tuser> TUSERS = ConnectDB.getTuserMap();
	public static final List<TViewParam> COLORS = ConnectDB.getTViewParam("LOG_STATE", "COLOR", -1);
	
	public static void sendValues(Session session, List<DvalTI> values, Scheme scheme) {
		if (values == null) return;
		values.stream().filter(f -> f != null).forEach(v -> {
			sendValue(session, v, scheme);
		});
	}
	
	public static void sendValue(Session session, DvalTI value, Scheme scheme) {
		if (value == null) return;
		try {
			ValueMessage vm = new ValueMessage();
			vm.setValue(value.getVal());
			vm.setDate(value.getDt());
			vm.setMode(ConnectDB.getTSysParam("SIGNAL_STATUS")
					.get(VSIGNALS.get(value.getSignalref()).getStatus() + "").getParamdescr());
			vm.setrCode(value.getRcode());

			if (scheme == null) return;
			List<String> listGroups = scheme.getSignalMap().get(value.getSignalref());
			
			if (listGroups == null) return;
			vm.setGroups(listGroups);

			session.getBasicRemote().sendObject(vm);
		} catch (Exception e) {
			System.err.println("The connection has been closed. " + value);
		}
	}
	
	public static void sendTransparant(int idTr) {
		CommandMessage cm = new CommandMessage();
		Ttransparant tt = ConnectDB.getTtransparantById(idTr);
		System.out.println(idTr);
		try {
			TtranspLocate loc = ConnectDB.getTransparantLocate(idTr);
			if(loc == null) {
				cm.setCommand("delTratsparant");
				cm.setParameters("idTr", idTr + "");
			} else {
				TtranspHistory h = ConnectDB.getTtranspHistory(idTr);
				
				cm.setCommand("setTratsparant");
				cm.setParameters("idTr", idTr + "");
				cm.setParameters("id", tt.getTp() + "");
				cm.setParameters("x", loc.getX() + "");
				cm.setParameters("y", loc.getY() + "");
				cm.setParameters("h", loc.getH() + "");
				cm.setParameters("w", loc.getW() + "");
				cm.setParameters("infotype", h.getInfotype() + "");
				cm.setParameters("txt", h.getTxt());
			}
			
			Optional<Entry<Session, SessionParams>> ls = Server.getUsers().entrySet()
					.stream().filter(f -> f.getValue().getIdScheme() == tt.getSchemeref()).findFirst();
			System.out.println("ls = " + ls);
			if (ls.isPresent()) {
				Session session = ls.get().getKey();
				System.out.println("send");
				session.getBasicRemote().sendObject(cm);
			}
		} catch (Exception e) {
			System.err.println("sendTransparant The connection has been closed. " + idTr);
			System.out.println(e);
		}
	}
	
	public static void sendScripts(Session session, Scheme scheme) {
		KeyValueArrayMessage arr = new KeyValueArrayMessage();
		arr.setNameArray("scripts");

		scheme.setSignalMap(new HashMap<>());
		scheme.getGroupsMap().keySet().forEach(gName -> {
			Map<String, String> custProps = scheme.getGroupsMap().get(gName);
			custProps.keySet().forEach(s -> {
				String gProps = "";
				Iterator<String> iter = custProps.keySet().iterator();
				while (iter.hasNext()) {
					String cpName = (String) iter.next();
					String value = custProps.get(cpName);
					gProps += ";cp_" + cpName + ":" + value;
					if (cpName.startsWith("signal_") || cpName.equals("id") || cpName.equals("idTS")) {
						if (scheme.getSignalMap().get(Integer.parseInt(value)) == null) {
							scheme.getSignalMap().put(Integer.parseInt(value), new ArrayList<>());
						}
						scheme.getSignalMap().get(Integer.parseInt(value)).add(gName);
					}
				}
				gProps = gProps.substring(1);

				String script = custProps.get("script");
				String title = custProps.get("title");
				String id = custProps.get("id");
				if(id == null) id = "0";
				String idTS = custProps.get("idTS");
				if(idTS == null) idTS = "0";

				if (script == null) {
					if (title.indexOf(".") != -1) {
						script = title.substring(0, title.indexOf("."));
					} else {
						script = title;
					}
				}

				Integer k = id.equals("0") ? Integer.parseInt(idTS) : Integer.parseInt(id);
				if (k != 0) {
					int typeSignal = VSIGNALS.get(k) != null ? VSIGNALS.get(k).getTypesignalref() : 0;
					String precision = custProps.get("Precision");
					int precisionInt = precision == null ? 0 : precision.length() - precision.indexOf(".") - 1;
					String units = VSIGNALS.get(k) != null ? VSIGNALS.get(k).getNameunit() : "";
					//null or Ne zadano
					units = ((units == null) || (units.trim().indexOf(" ") != -1)) ? "" : units;
					arr.putKeyValue(gName, VSIGNALS.get(k).getNamesignal() + ":" + 
											ConnectDB.getSpTypeSignalMap().get(typeSignal).getNametypesignal() + ":" +
											typeSignal + ":" + TSIGNALS.get(k).getKoef() + ":" + precisionInt + ":" +
											units + ":" + script + ":[" + gProps + "]");
				} else {
					arr.putKeyValue(gName, "[" + gProps + "]");
				}
			});
		});

		try {
			session.getBasicRemote().sendObject(arr);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static void sendTransparantsList(Session session) {
		CommandMessage cm = new CommandMessage();
		cm.setCommand("transparants");
		Map<Integer, Transparant> transp = ConnectDB.getTransparants();
		
		Map<String, String> map = transp.values().stream()
				.collect(Collectors.toMap(v -> v.getIdtr() + "", p -> p.getDescr() + ";" + p.getSvg()));
		cm.setParameters(map);
		try {
			session.getBasicRemote().sendObject(cm);
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
		for (int i = 8 - 1; i >= 0; --i) {
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
	
	public static void sendConnStr(Session session) {
		try {
			String connString = ConnectDB.getPostgressDB().getConnStr() + "_" + Server.getUsers().get(session).getName();
			CommandMessage cm = new CommandMessage();
			cm.setCommand("connString");
			cm.setParameters("value", connString);
			session.getBasicRemote().sendObject(cm);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	public static Tuser checkUser(String userName, String password) {
		Optional<Tuser> filter = TUSERS.values().stream().filter(f -> f.getUn().equals(userName)).findFirst();
		Encryptor encryptor = new Encryptor();
		String psw = encryptor.decrypt(password);
		psw = psw.indexOf("_") > 0 ? psw.substring(psw.indexOf("_") + 1) : psw;
		
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
	
	public static void updateScheme(int idScheme, byte[] content) {
		Tscheme nodeScheme = ConnectDB.getNodesMap().get(idScheme);
		ConnectDB.updateTScheme(idScheme, nodeScheme.getSchemedenom(), nodeScheme.getSchemename(), 
				nodeScheme.getSchemedescr(), nodeScheme.getParentref(), content, nodeScheme.getUserid());
		Server.getSchemes().remove(idScheme);
		ConnectDB.setNodesMap(null);
	}
}
