package pr.server;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpSession;
import javax.websocket.EncodeException;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import pr.SVGModel;
import pr.common.Utils;
import pr.db.ConnectDB;
import pr.model.Scheme;
import pr.model.Tscheme;
import pr.model.tools.SVGtrans;
import pr.model.tools.Tools;
import pr.server.messages.CommandMessage;
import pr.server.messages.Message;
import pr.server.messages.coders.MessageDecoder;
import pr.server.messages.coders.MessageEncoder;
import pr.svgObjects.CP;
import pr.svgObjects.G;
import pr.svgObjects.SVG;

@ServerEndpoint(value = "/load", configurator = GetHttpSessionConfigurator.class,
	encoders = {MessageEncoder.class}, decoders = {MessageDecoder.class})
public class Server {
	private HttpSession httpSession;
	private static int userId;
	private static final Map<Session, SessionParams> users = Collections.synchronizedMap(new HashMap<>());
	private static final Map<Integer, Scheme> schemes = Collections.synchronizedMap(new HashMap<>());
	
	public Server() throws UnsupportedEncodingException, IOException {
		System.out.println("====================< new Server >====================");
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
		
		System.out.println("Socket connected at " + new Date(System.currentTimeMillis()));
	}
	
	@OnMessage
	public void handlerMessage(final Session session, Message message) throws IOException, EncodeException {
		if (message instanceof CommandMessage) {
			final CommandMessage cm = (CommandMessage) message;
			switch (cm.getCommand().toLowerCase()) {
			case "getscheme":
				int idScheme = Integer.parseInt(cm.getParameters().get("idNode"));
				users.get(session).setIdScheme(idScheme);
				putScheme(session, idScheme);
				break;
			case "getoldvalues" :
				Scheme scheme = schemes.get(users.get(session).getIdScheme());
				Tools.sendValues(session, ConnectDB.getOldValues(scheme.getSignalMap().keySet()), scheme);
				Tools.sendActiveTransparants(session, scheme);
				break;
			case "getscripts" :
				scheme = schemes.get(users.get(session).getIdScheme());
				Tools.sendScripts(session, scheme);
				Tools.sendTransparantsList(session);
				break;
			case "settu" :
				scheme = schemes.get(users.get(session).getIdScheme());
				int idSignal = Integer.parseInt(cm.getParameters().get("id"));
				double value = Double.parseDouble(cm.getParameters().get("value"));
				ConnectDB.setTU(idSignal, value, 0, (int)users.get(session).getUserId(), scheme.getIdScheme());
				try {
					Thread.sleep(3000);
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
			case "updatescheme":
				scheme = schemes.get(users.get(session).getIdScheme());
				SVGModel svgModel = SVGModel.getInstance();
				Tscheme sch = ConnectDB.getNodesMap().get(scheme.getIdScheme());
				SVG svg = svgModel.getSVG(new ByteArrayInputStream((byte[])sch.getSchemefile()));

				Map<String, G> gMap = svg.getGroupMap();
				cm.getParameters().keySet().forEach(p -> {
					G g = gMap.get(p);
					String propsString = cm.getParameters().get(p);
					String[] arr = propsString.split(";");
					for (String prop : arr) {
						if (prop.startsWith("cp_")) {
							String pName = prop.substring(3, prop.indexOf(":"));
							String pValue = prop.substring(prop.indexOf(":") + 1);
							CP cp = g.getCustProps().getCPbyName(pName);
							if (cp != null) {
								cp.setVal(pValue);
							} else {
								CP newCP = new CP();
								newCP.setNameU(pName);
								newCP.setLbl(pName);
								newCP.setPrompt("");
								newCP.setType(0);
								newCP.setFormat("");
								newCP.setSortKey("");
								newCP.setInvis(false);
								newCP.setAsk(false);
								newCP.setVal(pValue);
								g.getCustProps().getCustomProps().add(newCP);
							}
						}
					}
					List<CP> list4remove = new ArrayList<>();
					g.getCustProps().getCustomProps().forEach(cp -> {
						if (propsString.indexOf("cp_" + cp.getNameU()) < 0)
							list4remove.add(cp);
					});
					list4remove.forEach(g.getCustProps().getCustomProps()::remove);
				});
				
				try(ByteArrayOutputStream out = svgModel.getOtputStream(svg);) {
					if (out != null) {
						Tools.updateScheme(scheme.getIdScheme(), out.toByteArray());
					}
				}
				svgModel.setObject("c:/1/PowerSys/target/1.svg", svg);
				break;
			case "addtransparant":
				try {
					int id = Integer.parseInt(cm.getParameters().get("id"));
					int idSignalRef = Integer.parseInt(cm.getParameters().get("idSignal"));
					double x = Double.parseDouble(cm.getParameters().get("x"));
					double y = Double.parseDouble(cm.getParameters().get("y"));
					String text = cm.getParameters().get("txt");
					String name = cm.getParameters().get("objName");
					Tools.addTransparant(id, text, users.get(session).getIdScheme(), (int)x, (int)y, name, idSignalRef);
				} catch (NumberFormatException e) {
					e.printStackTrace();
					System.out.println(cm.getParameters().get("id"));
					System.out.println(cm.getParameters().get("x"));
					System.out.println(cm.getParameters().get("y"));
				}
				break;
			case "deletetransparant":
				try {
					int id = Integer.parseInt(cm.getParameters().get("id"));
					Tools.deleteTransparant(id, users.get(session).getIdScheme());
				} catch (NumberFormatException e) {
					e.printStackTrace();
					System.out.println(cm.getParameters().get("id"));
				}
				break;
			case "updatetransparant":
				try {
					int idtr = Integer.parseInt(cm.getParameters().get("idtr"));
					double x = Double.parseDouble(cm.getParameters().get("x"));
					double y = Double.parseDouble(cm.getParameters().get("y"));
					String text = cm.getParameters().get("txt");
					Tools.updateTransparant(idtr, text, users.get(session).getIdScheme(), (int)x, (int)y);
				} catch (NumberFormatException e) {
					e.printStackTrace();
					System.out.println(cm.getParameters().get("id"));
				}
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
				System.out.println("Try GlassFish dir");
				scheme = SVGtrans.convert2matrix(Utils.getFullPath("../eclipseApps/PowerSysWeb/schemes/" + idScheme + ".svg"));
				if (scheme == null) {
					System.out.println("Try Tomcat dir");
					scheme = SVGtrans.convert2matrix(Utils.getFullPath("../webapps/PowerSysWeb/schemes/" + idScheme + ".svg"));
				}
			}
			scheme.setIdScheme(idScheme);
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
