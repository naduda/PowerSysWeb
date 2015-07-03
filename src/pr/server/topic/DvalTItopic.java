package pr.server.topic;

import java.sql.Timestamp;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;

import javax.websocket.Session;

import pr.db.jdbc.BatisJDBC;
import pr.db.jdbc.mappers.IMapper;
import pr.model.DvalTI;
import pr.model.Scheme;
import pr.model.tools.Tools;
import pr.server.Server;
import pr.server.SessionParams;

public class DvalTItopic extends ATopic {
	private List<DvalTI> ls = null;
	
	public DvalTItopic() {
		super();
		setSleepTimeout(1000);
	}

	@SuppressWarnings("unchecked")
	@Override
	public Timestamp senderMessage(Timestamp dt) {
		final Comparator<DvalTI> comp = (p1, p2) -> Long.compare( p1.getServdt().getTime(), p2.getServdt().getTime());
		try {
			Timestamp newDT = dt;
			ls = (List<DvalTI>) new BatisJDBC(s -> s.getMapper(IMapper.class).getLastTI(newDT)).get();

			if (ls != null && ls.size() > 0) {
				dt = ls.stream().max(comp).get().getServdt();
				Iterator<Session> iterator = Server.getUsers().keySet().iterator();
				while (iterator.hasNext()) {
					Session session = (Session) iterator.next();
					SessionParams sp = Server.getUsers().get(session);
					Scheme scheme = Server.getSchemes().get(sp.getIdScheme());
					Tools.sendValues(session, ls, scheme);
				}
			}
		} catch (Exception e) {
			System.out.println("Error in DvalTITopic.class!!!");
			try {
				Thread.sleep(60000); //Connection broken
			} catch (InterruptedException e1) {
//				LogFiles.log.log(Level.SEVERE, e1.getMessage(), e1);
			}
		}
		return dt;
	}
	
}
