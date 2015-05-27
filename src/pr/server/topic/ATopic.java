package pr.server.topic;

import java.sql.Timestamp;
import java.util.Date;
import java.util.Map;

import pr.model.Tsignal;
import pr.server.tools.Tools;

public abstract class ATopic implements Runnable {
	public final Map<Integer, Tsignal> signals = Tools.TSIGNALS;
	private boolean isRun;
	private long sleepTimeout = 100;
	private Timestamp dt;

	public ATopic() {
		isRun = true;
		dt = new Timestamp(new Date().getTime());
	}
	
	@Override
	public void run() {
		while (isRun) {
			try {
				dt = senderMessage(dt);
				Thread.sleep(sleepTimeout);
			} catch (Exception e) {
				e.printStackTrace();
			}
		}
	}
	
	abstract public Timestamp senderMessage(Timestamp dt);
	
	public boolean isRun() {
		return isRun;
	}

	public void setRun(boolean isRun) {
		this.isRun = isRun;
	}
	
	public long getSleepTimeout() {
		return sleepTimeout;
	}

	public void setSleepTimeout(long sleepTimeout) {
		this.sleepTimeout = sleepTimeout;
	}
}
