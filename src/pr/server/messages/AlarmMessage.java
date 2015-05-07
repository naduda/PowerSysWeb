package pr.server.messages;

import pr.server.tools.model.AlarmItem;

public class AlarmMessage extends Message {
	private final AlarmItem alarmItem;
	
	public AlarmMessage(AlarmItem alarmItem) {
		setType(this.getClass().getSimpleName());
		this.alarmItem = alarmItem;
	}

	public AlarmItem getAlarmItem() {
		return alarmItem;
	}
}
