package pr.rest;

import java.text.DateFormat;
import java.text.SimpleDateFormat;

import javax.ws.rs.ApplicationPath;
import javax.ws.rs.core.Application;

@ApplicationPath("dataServer")
public class ServerApplication extends Application {
	public static DateFormat dateFormat = new SimpleDateFormat("dd.MM.yyyy HH:mm:ss.SSS");
	public ServerApplication() {
		
	}
}
