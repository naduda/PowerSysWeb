package pr.server.topic;

import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;
import java.util.StringTokenizer;
import java.util.logging.Level;

import javax.websocket.Session;

import org.postgresql.PGConnection;
import org.postgresql.PGNotification;

import pr.db.ConnectDB;
import pr.log.LogFiles;
import pr.model.DvalTI;
import pr.model.Scheme;
import pr.model.tools.Tools;
import pr.server.Server;
import pr.server.SessionParams;

public class NotificationsListener extends ATopic {
	private PGConnection pgconn;
	private Connection conn;
	
	private PGConnection getPGConnection() {
		if (pgconn == null) {
			try {
				Connection conn = ConnectDB.getDataSource().getConnection();
				if(conn.isWrapperFor(org.postgresql.PGConnection.class)){
					pgconn = conn.unwrap(org.postgresql.PGConnection.class);
				}

				Statement stmt = conn.createStatement();
				stmt.execute("LISTEN t_device_au; LISTEN tx_add; LISTEN tr_update; LISTEN t_appstates_ai;");
				stmt.close();
			} catch (Exception e) {
				LogFiles.log.log(Level.SEVERE, e.getMessage(), e);
			}
		}
		return pgconn;
	}

	public Timestamp senderMessage(Timestamp dt) {
		try {
			if (conn != null && !conn.isValid(10)) {
				System.out.println("Not valid Connection !!!");
				pgconn = null;
			}

			PGNotification notifications[] = getPGConnection().getNotifications();
			if (notifications != null) {
				for (int i = 0; i < notifications.length; i++) {
					String nameNotify = notifications[i].getName().toLowerCase().trim();
					String parameters = notifications[i].getParameter().toLowerCase().trim();

					Iterator<Session> iterator = Server.getUsers().keySet().iterator();
					switch (nameNotify) {
						case "tx_add":
							DvalTI dti = getTX(parameters);
							while (iterator.hasNext()) {
								Session session = (Session) iterator.next();
								SessionParams sp = Server.getUsers().get(session);
								Scheme scheme = Server.getSchemes().get(sp.getIdScheme());
								Tools.sendValue(session, dti, scheme);
							}
							break;
						case "t_device_au":
							System.out.println(nameNotify + " ===> " + parameters);
//							msgObject.setObject("device;" + parameters);
							break;
						case "tr_update":
							try {
								Thread.sleep(1500);
							} catch (InterruptedException e) {
								e.printStackTrace();
							}
							Tools.sendTransparant(Integer.parseInt(parameters));
							break;
						case "t_appstates_ai":
							System.out.println(nameNotify + " ===> " + parameters);
							//LogFiles.log.log(Level.INFO, "t_appstates_ai;" + parameters);
							break;
						default:
							System.out.println(nameNotify + " ===> " + parameters);
							break;
					}
				}
			}
		} catch (SQLException e) {
			pgconn = null;
			try {
				Thread.sleep(60000);
			} catch (InterruptedException e1) {
				LogFiles.log.log(Level.SEVERE, e1.getMessage(), e1);
			}
		}
		
		return null;
	}
	
	private DvalTI getTX(String parameters) {
		DvalTI dti = new DvalTI();
		StringTokenizer st = new StringTokenizer(parameters, ";");
		String tt = st.nextElement().toString();
		dti.setTypeSignal(tt);
		
		dti.setSignalref(Integer.parseInt(st.nextElement().toString()));
		dti.setVal(Double.parseDouble(st.nextElement().toString()));
		try {
			SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd hh:mm:ss");
			String strDate = st.nextElement().toString();
			if (strDate.length() == 19) strDate = strDate + ".000";
			Date parsedDate = dateFormat.parse(strDate);
		Timestamp timestamp = new java.sql.Timestamp(parsedDate.getTime());
		dti.setDt(timestamp);
		
		dti.setRcode(Integer.parseInt(st.nextElement().toString()));
		
		strDate = st.nextElement().toString();
			if (strDate.length() == 19) strDate = strDate + ".000";
		parsedDate = dateFormat.parse(strDate);
		timestamp = new java.sql.Timestamp(parsedDate.getTime());
		dti.setServdt(timestamp);
		} catch(Exception e) {
			LogFiles.log.log(Level.SEVERE, e.getMessage(), e);
		}
				
		return dti;
	}

}