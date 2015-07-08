package pr.server;

public class SessionParams {
	private long userId;
	private int idScheme;
	private String name;
	private String ip;
	private String uniqId;
	
	public SessionParams(long userId, int idScheme) {
		this.idScheme = idScheme;
		this.userId = userId;
	}
	
	public SessionParams() {
		
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public int getIdScheme() {
		return idScheme;
	}

	public void setIdScheme(int idScheme) {
		this.idScheme = idScheme;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getIp() {
		return ip;
	}

	public void setIp(String ip) {
		this.ip = ip;
	}

	public String getUniqId() {
		return uniqId;
	}

	public void setUniqId(String uniqId) {
		this.uniqId = uniqId;
	}
}
