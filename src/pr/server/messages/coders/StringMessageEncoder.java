package pr.server.messages.coders;

public class StringMessageEncoder extends AEncoder {
	@Override
	public String encodeImpl(Object message) {
		return message.toString();
	}
}