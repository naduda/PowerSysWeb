package pr.server.topic;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.logging.Level;

import javax.websocket.Session;

import pr.db.jdbc.BatisJDBC;
import pr.db.jdbc.mappers.IMapper;
import pr.log.LogFiles;
import pr.model.DvalTI;
import pr.server.Scheme;
import pr.server.Server;
import pr.server.SessionParams;
import pr.server.tools.Tools;

public class DvalTItopic extends ATopic {
	private List<DvalTI> ls = null;
	
	public DvalTItopic(Map<Session, SessionParams> users) {
		super(users);
		setSleepTimeout(10000);
	}

	@SuppressWarnings("unchecked")
	@Override
	public Timestamp senderMessage(Timestamp dt) {
		final Comparator<DvalTI> comp = (p1, p2) -> Long.compare( p1.getServdt().getTime(), p2.getServdt().getTime());
		try {
			if (LocalDateTime.now().getMinute() == 0) {
				System.out.println(LocalDateTime.now());
				System.out.println("try get TI");
			}
			Timestamp newDT = dt;
			ls = (List<DvalTI>) new BatisJDBC(s -> s.getMapper(IMapper.class).getLastTI(newDT)).get();
	
			if (ls != null && ls.size() > 0) {
				dt = ls.stream().max(comp).get().getServdt();
				System.out.println(ls.size() + " - " + dt);
//				for (int i = 0; i < ls.size(); i++) {
//					DvalTI ti = ls.get(i);
//					if (i == 0) dt = ti.getServdt();
//					
//					ti.setVal(ti.getVal() * signals.get(ti.getSignalref()).getKoef());
//					long diff = Duration.between(ti.getDt().toInstant(), ti.getServdt().toInstant()).toMinutes();
//					if (diff > 3) {
//						ti.setActualData(false);
//						System.err.println("No actual data - " + ti.getSignalref() + 
//								"   [Diff = " + diff + " min;   servdt: " + 
//								new SimpleDateFormat("dd.MM.yyyy HH:mm:ss").format(ti.getServdt()) + "]");
//					}
//					msgObject.setObject(ti);
//					producer.send(topic, msgObject);
//				}
				Iterator<Session> iterator = users.keySet().iterator();
				while (iterator.hasNext()) {
					Session session = (Session) iterator.next();
					SessionParams sp = users.get(session);
					Scheme scheme = Server.getSchemes().get(sp.getIdScheme());
					Tools.sendValues(session, ls, scheme);
				}
			}
		} catch (Exception e) {
			try {
				if (ls == null) {
					LogFiles.log.log(Level.WARNING, "Connection broken -> sleep 1 min");
					Thread.sleep(60000); //Connection broken
				} else {
					LogFiles.log.log(Level.SEVERE, e.getMessage(), e);
				}
			} catch (InterruptedException e1) {
				LogFiles.log.log(Level.SEVERE, e1.getMessage(), e1);
			}
		}
		return dt;
	}
	
}
