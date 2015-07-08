package pr.server.messages.coders;

import javax.websocket.EncodeException;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;

public abstract class AEncoder  implements Encoder.Text<Object> {

	@Override
	public void destroy() {}

	@Override
	public void init(EndpointConfig config) {}

	@Override
	public String encode(Object obj) throws EncodeException {
		return encodeImpl(obj);
	}
	
	abstract public String encodeImpl(Object message);
}
