package pr.server.messages;

import java.util.HashMap;
import java.util.Map;

public class CommandMessage extends Message {
	private String command;
	private Map<String, String> parameters = new HashMap<>();
	
	public CommandMessage() {
		setType(this.getClass().getSimpleName());
	}
	
	public CommandMessage(String command) {
		this();
		setCommand(command);
	}

	public String getCommand() {
		return command;
	}

	public void setCommand(String command) {
		this.command = command;
	}
	
	public Map<String, String> getParameters() {
		return parameters;
	}

	public void setParameters(Map<String, String> parameters) {
		this.parameters = parameters;
	}
	
	public void setParameters(String key, String value) {
		this.parameters.put(key, value);
	}
}
