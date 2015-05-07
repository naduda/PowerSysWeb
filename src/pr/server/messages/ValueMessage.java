package pr.server.messages;

import java.sql.Timestamp;
import java.util.List;

public class ValueMessage extends Message {
	private double value;
	private String mode;
	private int rCode;
	private Timestamp date;
	private List<Group> groups;
	
	public ValueMessage() {
		setType(this.getClass().getSimpleName());
	}

	public double getValue() {
		return value;
	}

	public void setValue(double value) {
		this.value = value;
	}

	public String getMode() {
		return mode;
	}

	public void setMode(String mode) {
		this.mode = mode;
	}

	public int getrCode() {
		return rCode;
	}

	public void setrCode(int rCode) {
		this.rCode = rCode;
	}

	public Timestamp getDate() {
		return date;
	}

	public void setDate(Timestamp date) {
		this.date = date;
	}

	public List<Group> getGroups() {
		return groups;
	}

	public void setGroups(List<Group> groups) {
		this.groups = groups;
	}

	public static class Group {
		private String script;
		private String name;
		
		public Group() {
			
		}

		public String getScript() {
			return script;
		}

		public void setScript(String script) {
			this.script = script;
		}

		public String getName() {
			return name;
		}

		public void setName(String name) {
			this.name = name;
		}
	}
}
