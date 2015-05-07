package pr.server.topic;

import pr.server.Server;

public class MainTopic {
	public MainTopic() {
		System.out.println("=== MainTopic started ===");
	}
	
	public void start() {
		new Thread(new DvalTItopic(Server.getUsers()), "Thread_TI").start();
		new Thread(new AlarmsTopic(Server.getUsers()), "Thread_Alarms").start();
	}
}
