package pr.server.messages;

public class ResultMessage extends Message {
	private String result;
	
	public ResultMessage() {
		setType(this.getClass().getSimpleName());
	}

	public String getResult() {
		return result;
	}

	public void setResult(String result) {
		this.result = result;
	}
}
