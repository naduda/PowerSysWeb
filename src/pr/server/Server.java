package pr.server;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import pr.common.Encryptor;
import pr.db.ConnectDB;
import pr.model.Tuser;
import pr.server.messages.CommandMessage;
import pr.server.messages.Message;
import pr.server.messages.coders.MessageDecoder;
import pr.server.messages.coders.MessageEncoder;
import pr.server.tools.Tools;

@ServerEndpoint(value = "/load", encoders = {MessageEncoder.class}, decoders = {MessageDecoder.class})
public class Server {
	private static final Map<Session, SessionParams> users = Collections.synchronizedMap(new HashMap<>());
	private static final Map<Integer, Scheme> schemes = Collections.synchronizedMap(new HashMap<>());
	
	public Server() throws UnsupportedEncodingException, IOException {
		System.out.println("==================== new Server ====================");
	}
	
	@OnOpen
	public void handlerOpen(Session session) throws UnsupportedEncodingException, IOException, EncodeException {
		long id = System.currentTimeMillis();
		users.put(session, new SessionParams(id, 0));
		System.out.println("User connect at " + id + ". Now " + users.size() + " users.");
	}
	
	@OnMessage
	public void handlerMessage(final Session session, Message message) throws IOException, EncodeException {
		if (message instanceof CommandMessage) {
			CommandMessage cm = (CommandMessage) message;
			switch (cm.getCommand().toLowerCase()) {
			case "getscheme":
				int idScheme = Integer.parseInt(cm.getParameters().get("idNode"));
				users.get(session).setIdScheme(idScheme);
				if (users.get(session).getUserId() > Integer.MAX_VALUE) return;
				putScheme(session, idScheme);
				break;
			case "getoldvalues" :
				Scheme scheme = schemes.get(users.get(session).getIdScheme());
				Tools.sendValues(session, ConnectDB.getOldValues(scheme.getSignalMap().keySet()), scheme);
				break;
			case "getscripts" :
				scheme = schemes.get(users.get(session).getIdScheme());
				Tools.sendScripts(session, scheme);
				break;
			case "settu" :
				scheme = schemes.get(users.get(session).getIdScheme());
				int idSignal = Integer.parseInt(cm.getParameters().get("id"));
				double value = Double.parseDouble(cm.getParameters().get("value"));
				ConnectDB.setTU(idSignal, value, 0, (int)users.get(session).getUserId(), scheme.getIdScheme());
				try {
					Thread.sleep(3000);
					cm = new CommandMessage();
					cm.setCommand("updateTU");
					Map<String, String> parameters = new HashMap<>();
					parameters.put("status", "1");
					cm.setParameters(parameters);
					
					session.getBasicRemote().sendObject(cm);
				} catch (InterruptedException e) {
					e.printStackTrace();
				}
				break;
			case "checkuser":
				String userName = cm.getParameters().get("name");
				String password = cm.getParameters().get("password");
				CommandMessage rm = new CommandMessage();
				rm.setCommand("runAll");
				Map<String, String> parameters = new HashMap<>();
				
				Tuser user = Tools.checkUser(userName, password);
				if (user != null) {
					users.get(session).setUserId(user.getIduser());
					putScheme(session, users.get(session).getIdScheme());
					Tools.sendAlarms(session, ConnectDB.getAlarmsByPeriod(null, null));
					Tools.sendPriorities(session, ConnectDB.getTSysParam("ALARM_PRIORITY"));

					parameters.put("status", "1");
					String connString = ConnectDB.getPostgressDB().getConnStr();
					parameters.put("user", userName);
					parameters.put("server", connString.substring(0, connString.indexOf("_")));
					parameters.put("db", connString.substring(connString.indexOf("_") + 1));
					
					rm.setParameters(parameters);
					String unicUser = cm.getParameters().get("IP") + System.currentTimeMillis();
					Encryptor encryptor = new Encryptor();
					unicUser = encryptor.encrypt(unicUser);
					
					users.get(session).setIp(cm.getParameters().get("IP"));
					users.get(session).setUniqId(unicUser);
					parameters.put("uniqId", unicUser);
					session.getBasicRemote().sendObject(rm);
					System.out.println("Login user - " + cm.getParameters().get("IP") + " at " + new Date(System.currentTimeMillis()));
				} else {
					parameters.put("status", "0");
					rm.setParameters(parameters);					
					session.getBasicRemote().sendObject(rm);
					System.out.println("Faul connection - " + cm.getParameters().get("IP"));
				}
				break;
			case "confimalarmone":
				String messConfirm = cm.getParameters().get("text").trim();
				cm.getParameters().remove("text");
				Tools.confirmAlarms((int)users.get(session).getUserId(), messConfirm, cm.getParameters());
				break;
			case "confimalarmall":
				messConfirm = cm.getParameters().get("text").trim();
				ConnectDB.confirmAlarmAll(messConfirm, (int)users.get(session).getUserId());
				break;
			case "setuserid":
				users.get(session).setUserId(Long.parseLong(cm.getParameters().get("userId")));
				break;
			default:
				System.err.println(cm.getCommand().toLowerCase());
				break;
			}
		}
	}
	
	private void putScheme(Session session, int idScheme) {
		if(idScheme == 0) return;
		Scheme scheme = null; 
		if (schemes.containsKey(idScheme)) {
			scheme = schemes.get(idScheme);
		} else {
			scheme = SVGtrans.convert2matrix("d:/GIT/PowerSysWeb/PowerSysWeb/WebContent/schemes/" + idScheme + ".svg");
			schemes.put(idScheme, scheme);
		}

		CommandMessage rm = new CommandMessage();
		rm.setCommand("scheme");
		Map<String, String> parameters = new HashMap<>();
		parameters.put("content", scheme.getContent());
		parameters.put("fill", scheme.getBackground());
		rm.setParameters(parameters);
		
		try {
			session.getBasicRemote().sendObject(rm);
		} catch (IOException | EncodeException e) {
			e.printStackTrace();
		}
	}
	
	@OnClose
	public void handlerClose(Session session) {
		users.remove(session);
		long id = System.currentTimeMillis();
		System.out.println("User disconnect at " + id + ". Now " + users.size() + " users.");
	}
	
	public static void clearUsers() {
		Iterator<Session> iter = users.keySet().iterator();
		while (iter.hasNext()) {
			Session session = (Session) iter.next();
			users.remove(session);
		}
	}
	
	public static Map<Session, SessionParams> getUsers() {
		return users;
	}

	public static Map<Integer, Scheme> getSchemes() {
		return schemes;
	}
}
