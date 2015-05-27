package pr.server.topic;

public class MainTopic {
	public MainTopic() {
		System.out.println("=== MainTopic started ===");
	}
	
	public void start() {
		new Thread(new DvalTItopic(), "Thread_TI").start();
		new Thread(new AlarmsTopic(), "Thread_Alarms").start();
	}
}
