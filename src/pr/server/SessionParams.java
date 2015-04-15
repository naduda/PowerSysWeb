package pr.server;

public class SessionParams {
	private int userId;
	private int idScheme;
	
	public SessionParams(int userId, int idScheme) {
		this.idScheme = idScheme;
		this.userId = userId;
	}
	
	public SessionParams() {
		
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public int getIdScheme() {
		return idScheme;
	}

	public void setIdScheme(int idScheme) {
		this.idScheme = idScheme;
	}
}
