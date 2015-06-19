package pr.server.messages;

import java.sql.Timestamp;
import java.util.List;

public class ValueMessage extends Message {
	private double value;
	private String mode;
	private int rCode;
	private Timestamp date;
	private List<String> groups;
	
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

	public List<String> getGroups() {
		return groups;
	}

	public void setGroups(List<String> groups) {
		this.groups = groups;
	}
}
