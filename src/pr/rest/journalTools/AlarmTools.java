package pr.rest.journalTools;

import java.util.List;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;

import pr.db.ConnectDB;
import pr.model.Alarm;
import pr.model.AlarmItem;

public class AlarmTools {
	
	public AlarmTools() {
		
	}
	
	public String getAlarmsByPeriod(String dtBeg, String dtEnd) {
		List<Alarm> alarms = ConnectDB.getAlarmsByPeriod(dtBeg, dtEnd);
		JsonArrayBuilder arr = Json.createArrayBuilder();
		alarms.forEach(v -> {
			AlarmItem a = new AlarmItem(v);
			JsonObjectBuilder al = Json.createObjectBuilder();
			al.add("object", a.getObject())
				.add("location", a.getLocation())
				.add("alarmName", a.getAlarmName())
				.add("recordDT", a.getRecordDT())
				.add("eventDT", a.getEventDT())
				.add("alarmMES", a.getAlarmMES())
				.add("logState", a.getLogState())
				.add("logStateInt", a.getLogStateInt())
				.add("confirmDT", a.getConfirmDT())
				.add("userRef", a.getUserRef())
				.add("logNote", a.getLogNote())
				.add("alarmPriority", a.getAlarmPriority())
				.add("alarmPriorityInt", a.getAlarmPriorityInt())
				.add("eventType", a.getEventType())
				.add("schemeObject", a.getSchemeObject())
				.add("color", a.getColor())
				.add("objectRef", a.getObjectRef());
			arr.add(al);
		});
		
		return arr.build().toString();
	}
	
	public static String getTSysParam(String param) {
		JsonArrayBuilder arr = Json.createArrayBuilder();
		ConnectDB.getTSysParam(param).values().forEach(e -> {
			JsonObjectBuilder al = Json.createObjectBuilder();
			al.add("name", e.getParamdescr()).add("value", e.getVal());
			arr.add(al);
		});
		return arr.build().toString();
	}
}
