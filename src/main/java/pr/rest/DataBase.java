package pr.rest;

import java.sql.Timestamp;
import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import javax.json.Json;
import javax.json.JsonArrayBuilder;
import javax.json.JsonObjectBuilder;
import javax.servlet.http.HttpServletRequest;
import javax.ws.rs.GET;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.PathParam;
import javax.ws.rs.Produces;
import javax.ws.rs.QueryParam;
import javax.ws.rs.core.Context;
import javax.ws.rs.core.MediaType;

import pr.db.ConnectDB;
import pr.model.LinkedValue;
import pr.model.tools.Tools;
import pr.rest.journalTools.AlarmTools;

@Path("/db")
public class DataBase {
	private static final DateFormat DATE_FORMAT = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss.SSS");
	
	@Produces(MediaType.APPLICATION_JSON)
	@GET
	public static String getSignalByIdTree(@QueryParam("id") String id) {
		return ConnectDB.getChildNodes(id);
	}
	
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{comand}")
	@GET
	public static String getDataById(@PathParam("comand") String comand, 
			@QueryParam("params") String params) throws ParseException {

		String ret = "";
		switch (comand.toLowerCase()) {
		case "getdatabyid":
			String[] pArray = params.split("_");
			if (pArray.length == 1) {
				return "";
			}
			int idSignal = Integer.parseInt(pArray[0]);
			int period = Integer.parseInt(pArray[3]);
			boolean dateIsLong = false;
			try {
				Long.parseLong(pArray[1]);
				dateIsLong = true;
			} catch (Exception e) {

			}
			Timestamp dtBeg = dateIsLong ? new Timestamp(Long.parseLong(pArray[1])) : 
										   new Timestamp(DATE_FORMAT.parse(pArray[1] + " 00:00:00.000").getTime());
			Timestamp dtEnd = dateIsLong ? new Timestamp(Long.parseLong(pArray[2])) : 
										   new Timestamp(DATE_FORMAT.parse(pArray[2] + " 00:00:00.000").getTime());
			
			List<LinkedValue> data = ConnectDB.getDataIntegrArc(idSignal, dtBeg, dtEnd, period);
			
			int r = Math.round(data.size()/50);
			if (r == 0) r = 1;
			JsonArrayBuilder dataArray = Json.createArrayBuilder();
			for (int i = 0; i < data.size(); i++) {
				try {
					if (i % r == 0) {
						LinkedValue v = data.get(i);
						JsonObjectBuilder jData = Json.createObjectBuilder()
								.add("value", v.getVal().toString())
								.add("timestamp", ((Date)v.getDt()).getTime());
						dataArray.add(jData);
					}
				} catch (Exception e) {
					System.out.println(i + " ===> " + r);
				}
			}

			ret = Json.createObjectBuilder()
					.add("signalName", Tools.VSIGNALS.get(idSignal).getNamesignal())
					.add("idSignal", idSignal)
					.add("data", dataArray).build().toString();
			break;
		case "priority":
			ret = AlarmTools.getTSysParam("ALARM_PRIORITY");
			break;
		case "childsignals":
			ret = ConnectDB.getChildSignals(params);
			break;
		case "childsignalpath":
			ret = ConnectDB.getChildSignalPath(params);
			break;
		case "transparant":
//			Tools
			break;
		default: ret = "Get: > Comand <" + comand + "> not found"; break;
		}
		return ret;
	}
	
	@Produces(MediaType.APPLICATION_JSON)
	@Path("{comand}")
    @POST
	public static String getDataByIdPost(@PathParam("comand") String comand, 
			@QueryParam("params") String params, @Context HttpServletRequest request) throws ParseException {
		
		String ret = "";
		switch (comand.toLowerCase()) {
//		case "checkuser":
//			Encryptor encryptor = new Encryptor();
//			String encript = encryptor.encrypt(System.currentTimeMillis() + "_" + params);
//			ret = Json.createObjectBuilder()
//					.add("encript", encript)
//					.add("clientIP", request.getRemoteAddr()).build().toString();
//			break;
		default: ret = "Post: > Comand <" + comand + "> not found"; break;
		}
		return ret;
	}
}
	
