package pr.server.messages.coders;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public class StringMessageEncoder implements Encoder.Text<String> {

	@Override
	public void destroy() {
		
	}

	@Override
	public void init(EndpointConfig config) {
		
	}

	@Override
	public String encode(String message) throws EncodeException {
		return message;
	}
}