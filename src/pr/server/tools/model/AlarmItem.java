package pr.server.tools.model;

import java.text.SimpleDateFormat;
import java.util.List;
import java.util.stream.Collectors;

import pr.db.ConnectDB;
import pr.model.Alarm;
import pr.model.TViewParam;
import pr.server.tools.Tools;

public class AlarmItem {
	private final String object;
	private final String objectRef;
	private final String location;
	private final String alarmName;
	private final String recordDT;
	private final String eventDT;
	private final String alarmMES;
	private final String logState;
	private final int logStateInt;
	private final String confirmDT;
	private final String userRef;
	private final String logNote;
	private final String alarmPriority;
	private final int alarmPriorityInt;
	private final String eventType;
	private final String schemeObject;
	
	private final String color;
	
	public AlarmItem(Alarm a) {
		SimpleDateFormat dFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss.");
		String eMilli = a.getEventdt().toString().split("\\.")[1];
		String rMilli = a.getRecorddt().toString().split("\\.")[1];
		String cMilli = a.getConfirmdt() != null ? a.getConfirmdt().toString().split("\\.")[1] : "";
		
		objectRef = a.getObjref() + "";
		object = Tools.VSIGNALS.get(a.getObjref()).getNamesignal();
		location = Tools.VSIGNALS.get(a.getObjref()).getSignalpath();
		alarmName = a.getAlarmname();
		recordDT = a.getRecorddt() != null ? dFormat.format(a.getRecorddt()) + rMilli : "";
		eventDT = a.getEventdt() != null ? dFormat.format(a.getEventdt()) + eMilli: "";
		alarmMES = a.getAlarmmes();
		logStateInt = a.isAlarmuser_ack() ? a.getLogstate() : 10;
    	a.setLogstate(logStateInt);
		logState = ConnectDB.getTSysParam("LOG_STATE").get("" + a.getLogstate()).getParamdescr();
		confirmDT = a.getConfirmdt() != null ? dFormat.format(a.getConfirmdt()) + cMilli : "";
		userRef = a.getUserref() == 0 ? "" : 
			a.getUserref() == -1 ? "Administrator" : Tools.TUSERS.get(a.getUserref()).getFio();
		logNote = a.getLognote();
		alarmPriority = ConnectDB.getTSysParam("ALARM_PRIORITY").get("" + a.getAlarmpriority()).getParamdescr();
		alarmPriorityInt = a.getAlarmpriority();
		eventType = ConnectDB.getTSysParam("ALARM_EVENT").get("" + a.getEventtype()).getParamdescr();
		schemeObject = "";
		
		List<TViewParam> fVP = Tools.COLORS.stream().
				filter(sp -> sp.getAlarmref() == a.getAlarmid()).
				filter(sp -> Integer.parseInt(sp.getObjref()) == a.getLogstate()).
				collect(Collectors.toList());
		
		String col = fVP.size() > 0 ? fVP.get(0).getParamval() : "0";
		color = "#" + Tools.decToHex(Long.parseLong(col)).substring(2);
	}

	public String getObject() {
		return object;
	}

	public String getObjectRef() {
		return objectRef;
	}

	public String getLocation() {
		return location;
	}

	public String getAlarmName() {
		return alarmName;
	}

	public String getRecordDT() {
		return recordDT;
	}

	public String getEventDT() {
		return eventDT;
	}

	public String getAlarmMES() {
		return alarmMES;
	}

	public String getLogState() {
		return logState;
	}

	public int getLogStateInt() {
		return logStateInt;
	}

	public String getConfirmDT() {
		return confirmDT;
	}

	public String getUserRef() {
		return userRef;
	}

	public String getLogNote() {
		return logNote;
	}

	public String getAlarmPriority() {
		return alarmPriority;
	}

	public int getAlarmPriorityInt() {
		return alarmPriorityInt;
	}

	public String getEventType() {
		return eventType;
	}

	public String getSchemeObject() {
		return schemeObject;
	}

	public String getColor() {
		return color;
	}
}
