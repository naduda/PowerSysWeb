package pr.server;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;

import javax.json.Json;
import javax.websocket.CloseReason;
import javax.websocket.EncodeException;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import pr.model.tools.Tools;
import pr.server.messages.coders.StringMessageEncoder;

@ServerEndpoint(value = "/fileserver", encoders = {StringMessageEncoder.class})
public class FileServer {
	private ByteArrayOutputStream fos;
	private String msgType;
	private String originalMessage;

	@OnOpen
	public void open(Session session, EndpointConfig conf) {
		System.out.println("FileServer open");
	}

	@OnMessage
	public void processUpload(ByteBuffer msg, boolean last, Session session) throws IOException, EncodeException {
		while(msg.hasRemaining()) {
			fos.write(msg.get());
		}
	}

	@OnMessage
	public void message(Session session, String msg) {
		if(!msg.equals("end")) {
			originalMessage = msg;
			msgType = msg.substring(0, msg.indexOf(":"));
			fos = new ByteArrayOutputStream();
		} else {
			try {
				fos.flush();
				fos.close();
				
				switch (msgType) {
				case "idScheme":
					String idScheme = originalMessage.substring(originalMessage.indexOf(':') + 1, originalMessage.indexOf(";"));
					int id = Integer.parseInt(idScheme);
					Tools.updateScheme(session, id, fos.toByteArray());
					System.out.println("Changed scheme with ID = " + id);
					break;
				}
				
				session.getBasicRemote().sendObject(Json.createObjectBuilder().add("type", "OK").build().toString());
			} catch (IOException | EncodeException e) {
				try {
					session.getBasicRemote().sendObject(Json.createObjectBuilder().add("type", "ERROR").build().toString());
				} catch (IOException | EncodeException e1) {}
				e.printStackTrace();
			}
		}
	}

	@OnClose
	public void close(Session session, CloseReason reason) {
		System.out.println("FileServer closed: " + reason.getReasonPhrase());
	}

	@OnError
	public void error(Session session, Throwable t) {
		t.printStackTrace();
	}
}
