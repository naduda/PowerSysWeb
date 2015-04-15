package pr.server;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

import javax.websocket.EncodeException;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import pr.db.ConnectDB;
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
		
//		new Thread(new Runnable() {
//			@Override
//			public void run() {
//				while (true) {
//					if (users.size() > 0) {
//						try {
//							Set<Session> sessions = users.keySet();
//							Iterator<Session> iterator = sessions.iterator();
//							while (iterator.hasNext()) {
//								Session session = (Session) iterator.next();
//								session.getBasicRemote().sendObject(treeContent);
//								System.out.println(treeContent.getResult());
//							}
//						} catch (IOException | EncodeException e) {
//							e.printStackTrace();
//						}
//					}
//					
//					try {
//						Thread.sleep(15000);
//					} catch (InterruptedException e) {
//						e.printStackTrace();
//					}
//					
//				}
//			}
//		}).start();
	}
	
	@OnOpen
	public void handlerOpen(Session session) throws UnsupportedEncodingException, IOException, EncodeException {
		users.put(session, new SessionParams(0, 0));
		Tools.sendAlarms(session, ConnectDB.getCurDayAlarms());
		Tools.sendPriorities(session, ConnectDB.getTSysParam("ALARM_PRIORITY"));
	}
	
	@OnMessage
	public void handlerMessage(final Session session, Message message) throws IOException, EncodeException {
		if (message instanceof CommandMessage) {
			CommandMessage cm = (CommandMessage) message;
			switch (cm.getCommand().toLowerCase()) {
			case "getscheme":
				int idScheme = Integer.parseInt(cm.getParameters().get("idNode"));
				
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
				
				session.getBasicRemote().sendObject(rm);
				users.get(session).setIdScheme(idScheme);
				break;
			case "getoldvalues" :
				scheme = schemes.get(users.get(session).getIdScheme());
				Tools.sendValues(session, ConnectDB.getOldValues(scheme.getSignalMap().keySet()), scheme);
				break;
			case "getscripts" :
				scheme = schemes.get(users.get(session).getIdScheme());
				Tools.sendScripts(session, scheme);
				break;
			default:
				break;
			}
		}
	}
	
	@OnClose
	public void handlerClose(Session session) {
		users.remove(session);
	}
}
