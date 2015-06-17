package pr.server;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.websocket.EncodeException;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import pr.db.ConnectDB;
import pr.model.Scheme;
import pr.model.Tscheme;
import pr.model.tools.SVGtrans;
import pr.model.tools.Tools;
import pr.server.messages.CommandMessage;
import pr.server.messages.Message;
import pr.server.messages.coders.MessageDecoder;
import pr.server.messages.coders.MessageEncoder;

@ServerEndpoint(value = "/load", configurator = GetHttpSessionConfigurator.class,
	encoders = {MessageEncoder.class}, decoders = {MessageDecoder.class})
public class Server {
	private HttpSession httpSession;
	private static int userId;
	private static final Map<Session, SessionParams> users = Collections.synchronizedMap(new HashMap<>());
	private static final Map<Integer, Scheme> schemes = Collections.synchronizedMap(new HashMap<>());
	
	public Server() throws UnsupportedEncodingException, IOException {
		System.out.println("==================== new Server ====================");
	}
	
	@OnOpen
	public void handlerOpen(Session session, EndpointConfig config) throws UnsupportedEncodingException, IOException, EncodeException {
		httpSession = (HttpSession) config.getUserProperties().get(HttpSession.class.getName());
		userId = Integer.parseInt(httpSession.getAttribute("userId").toString());
		users.put(session, new SessionParams(userId, 0));
		users.get(session).setName(httpSession.getAttribute("user").toString());
		Tools.sendAlarms(session, ConnectDB.getAlarmsByPeriod(null, null));
		Tools.sendPriorities(session, ConnectDB.getTSysParam("ALARM_PRIORITY"));
		Tools.sendConnStr(session);
		
		long id = System.currentTimeMillis();
		System.out.println("Socket connected at " + new Date(id));
	}
	
	@OnMessage
	public void handlerMessage(final Session session, Message message) throws IOException, EncodeException {
		if (message instanceof CommandMessage) {
			CommandMessage cm = (CommandMessage) message;
			switch (cm.getCommand().toLowerCase()) {
			case "getscheme":
				int idScheme = Integer.parseInt(cm.getParameters().get("idNode"));
				users.get(session).setIdScheme(idScheme);
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
			try {
				Tscheme sch = ConnectDB.getNodesMap().get(idScheme);
				scheme = SVGtrans.convert2matrix(new ByteArrayInputStream((byte[])sch.getSchemefile()));
			} catch (Exception e) {
				scheme = SVGtrans.convert2matrix("d:/GIT/PowerSysWeb/PowerSysWeb/WebContent/schemes/" + idScheme + ".svg");
			}
			
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
		System.out.println("Socket disconnected at " + new Date(id));
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

	public static int getUserId() {
		return userId;
	}
}
