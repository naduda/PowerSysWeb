package pr.server.messages.coders;

import java.util.Iterator;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;

import pr.server.messages.AlarmMessage;
import pr.server.messages.KeyValueArrayMessage;
import pr.server.messages.Message;
import pr.server.messages.CommandMessage;
import pr.server.messages.ResultMessage;
import pr.server.messages.ValueMessage;

public class MessageEncoder extends AEncoder {
	@Override
	public String encodeImpl(Object mess) {
		Message message = (Message)mess;
		String result = null;
		if (message instanceof CommandMessage) {
			CommandMessage commandMessage = (CommandMessage) message;
			JsonArrayBuilder params = Json.createArrayBuilder();
			Iterator<String> iterator = commandMessage.getParameters().keySet().iterator();
			
			while (iterator.hasNext()) {
				String key = (String) iterator.next();
				String par = commandMessage.getParameters().get(key);
				JsonObjectBuilder param = Json.createObjectBuilder();
				param.add(key, par);
				params.add(param);
			}
			
			result = Json.createObjectBuilder().add("type", commandMessage.getClass().getSimpleName())
					.add("command", commandMessage.getCommand())
					.add("parameters", params).build().toString();
		}
		if (message instanceof ResultMessage) {
			ResultMessage resultMessage = (ResultMessage) message;
			result = Json.createObjectBuilder().add("type", resultMessage.getClass().getSimpleName())
					.add("result", resultMessage.getResult()).build().toString();
		}
		if (message instanceof ValueMessage) {
			ValueMessage vm = (ValueMessage) message;
			JsonArrayBuilder groups = Json.createArrayBuilder();
			vm.getGroups().forEach(g -> {
				JsonObjectBuilder group = Json.createObjectBuilder();
				group.add("name", g);
				groups.add(group);
			});
			
			result = Json.createObjectBuilder().add("type", vm.getClass().getSimpleName())
					.add("value", vm.getValue())
					.add("mode", vm.getMode())
					.add("rcode", vm.getrCode())
					.add("timestamp", vm.getDate().getTime())
					.add("groups", groups).build().toString();
		}
		if (message instanceof AlarmMessage) {
			AlarmMessage vm = (AlarmMessage) message;
			
			result = Json.createObjectBuilder().add("type", vm.getClass().getSimpleName())
					.add("object", vm.getAlarmItem().getObject())
					.add("location", vm.getAlarmItem().getLocation())
					.add("alarmName", vm.getAlarmItem().getAlarmName())
					.add("recordDT", vm.getAlarmItem().getRecordDT())
					.add("eventDT", vm.getAlarmItem().getEventDT())
					.add("alarmMES", vm.getAlarmItem().getAlarmMES())
					.add("logState", vm.getAlarmItem().getLogState())
					.add("logStateInt", vm.getAlarmItem().getLogStateInt())
					.add("confirmDT", vm.getAlarmItem().getConfirmDT())
					.add("userRef", vm.getAlarmItem().getUserRef())
					.add("logNote", vm.getAlarmItem().getLogNote())
					.add("alarmPriority", vm.getAlarmItem().getAlarmPriority())
					.add("alarmPriorityInt", vm.getAlarmItem().getAlarmPriorityInt())
					.add("eventType", vm.getAlarmItem().getEventType())
					.add("schemeObject", vm.getAlarmItem().getSchemeObject())
					.add("color", vm.getAlarmItem().getColor())
					.add("objectRef", vm.getAlarmItem().getObjectRef()).build().toString();
		}
		if (message instanceof KeyValueArrayMessage) {
			KeyValueArrayMessage vm = (KeyValueArrayMessage) message;
			JsonArrayBuilder arr = Json.createArrayBuilder();
			Iterator<String> iter = vm.getKeyValue().keySet().iterator();
			while (iter.hasNext()) {
				String key = (String) iter.next();
				JsonObjectBuilder el = Json.createObjectBuilder();
				el.add(key, vm.getKeyValue().get(key));
				arr.add(el);
			}
			
			result = Json.createObjectBuilder().add("type", vm.getClass().getSimpleName())
					.add("name", vm.getNameArray())
					.add("array", arr).build().toString();
		}
		return result;
	}
}
