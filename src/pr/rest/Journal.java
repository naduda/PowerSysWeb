package pr.rest;

import java.util.List;




import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.MediaType;




import pr.db.ConnectDB;
import pr.model.Alarm;import pr.server.tools.model.AlarmItem;


@Path("/journal")
public class Journal {
	private static final int ALARM_JOURNAL = 1;

	@Produces(MediaType.APPLICATION_JSON)
    @GET
	public static String getSignalByIdTree(@QueryParam("id") String id) {
//		http://localhost:8080/PowerSysWeb/dataServer/journal?id=1
		String ret = null;
		System.out.println(id + " === " + Integer.parseInt(id));
		switch (Integer.parseInt(id)) {
		case ALARM_JOURNAL:
			List<Alarm> alarms = ConnectDB.getCurDayAlarms();
			JsonArrayBuilder arr = Json.createArrayBuilder();
			alarms.forEach(v ->{
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
			ret = arr.build().toString();
			break;
		default:
			ret = Json.createObjectBuilder().add("Id", id).build().toString();
			break;
		}
		return ret;
	}

}
