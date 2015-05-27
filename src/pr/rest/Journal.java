package pr.rest;

import javax.json.Json;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import pr.rest.journalTools.AlarmTools;
import pr.server.Server;

@Path("/journal")
public class Journal {
	private static final int ALARM_JOURNAL = 1;

	@Produces(MediaType.APPLICATION_JSON)
    @GET
	public static String getSignalByIdTree(@QueryParam("id") String id, @Context HttpServletRequest request) {
		String uniqId = id.substring(id.indexOf(";") + 1).replaceAll(" ", "+");
		String[] arr = id.substring(0, id.indexOf(";")).split("_");
		String dtBeg = null;
		String dtEnd = null;
		id = arr[0];
		if (arr.length > 1) {
			dtBeg = arr[1];
			dtEnd = arr[2];
		}
		
		if (Server.getUsers().values().stream().filter(u -> uniqId.equals(u.getUniqId())).count() != 1) return null;
		if (!Server.getUsers().values().stream().filter(u -> uniqId.equals(u.getUniqId())).findFirst().get().getIp()
				.equals(request.getRemoteAddr())) return null;
//		http://localhost:8080/PowerSysWeb/dataServer/journal?id=1
		String ret = null;
		switch (Integer.parseInt(id)) {
		case ALARM_JOURNAL:
			ret = "{\"userId\": " + 
					Server.getUsers().values().stream().filter(u -> uniqId.equals(u.getUniqId())).findFirst().get().getUserId() + 
					", \"alarms\": " + new AlarmTools().getAlarmsByPeriod(dtBeg, dtEnd) + "}";
			break;
		default:
			ret = Json.createObjectBuilder().add("Id", id).build().toString();
			break;
		}
		return ret;
	}

}
