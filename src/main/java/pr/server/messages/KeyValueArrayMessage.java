package pr.server.messages;

import java.util.HashMap;
import java.util.Map;

public class KeyValueArrayMessage extends Message {
	private String nameArray;
	private Map<String, String> keyValue = new HashMap<>();
	
	public KeyValueArrayMessage() {
		setType(this.getClass().getSimpleName());
	}

	public String getNameArray() {
		return nameArray;
	}

	public void setNameArray(String nameArray) {
		this.nameArray = nameArray;
	}

	public Map<String, String> getKeyValue() {
		return keyValue;
	}

	public void setKeyValue(Map<String, String> keyValue) {
		this.keyValue = keyValue;
	}
	
	public void putKeyValue(String key, String value) {
		keyValue.put(key, value);
	}
}
