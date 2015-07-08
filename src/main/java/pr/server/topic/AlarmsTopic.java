package pr.server.topic;

import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import javax.websocket.Session;

import pr.db.jdbc.BatisJDBC;
import pr.db.jdbc.mappers.IMapper;
import pr.model.Alarm;
import pr.model.AlarmItem;
import pr.server.Server;
import pr.server.messages.AlarmMessage;

public class AlarmsTopic extends ATopic {
	private List<Alarm> ls = new ArrayList<>();
	private List<Alarm> confirmed = new ArrayList<>();
	private Timestamp dtConfirmed = new Timestamp(System.currentTimeMillis());
	
	public AlarmsTopic() {
		super();
	}

	@SuppressWarnings("unchecked")
	@Override
	public Timestamp senderMessage(Timestamp dt) {
		try {
			Timestamp newDT = dt;
			ls = (List<Alarm>) new BatisJDBC(s -> s.getMapper(IMapper.class).getAlarms(newDT)).get();
			Timestamp newDTconf = dtConfirmed;
			confirmed = (List<Alarm>) new BatisJDBC(s -> s.getMapper(IMapper.class).getAlarmsConfirm(newDTconf)).get(); 
			
			if (ls != null && confirmed != null) ls.removeAll(confirmed);
			if (ls != null && ls.size() > 0) {
				dt = ls.get(0).getRecorddt();
				ls.forEach(a -> {
					Iterator<Session> iter = Server.getUsers().keySet().iterator();
					while (iter.hasNext()) {
						Session session = (Session) iter.next();
						try {
							session.getBasicRemote().sendObject(new AlarmMessage(new AlarmItem(a)));
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				});
			}
			
			if (confirmed != null && confirmed.size() > 0) {
				dtConfirmed = confirmed.get(0).getConfirmdt();

				confirmed.forEach(a -> {
					Iterator<Session> iter = Server.getUsers().keySet().iterator();
					while (iter.hasNext()) {
						Session session = (Session) iter.next();
						try {
							session.getBasicRemote().sendObject(new AlarmMessage(new AlarmItem(a)));
						} catch (Exception e) {
							e.printStackTrace();
						}
					}
				});
			}
		} catch (Exception e) {
//			LogFiles.log.log(Level.SEVERE, e.getMessage(), e);
			System.out.println("Error in AlarmsTopic.class!!!");
			try {
				if (ls == null) Thread.sleep(60000); //Connection broken
			} catch (InterruptedException e1) {
//				LogFiles.log.log(Level.SEVERE, e1.getMessage(), e1);
			}
		}
		return dt;
	}

	@Override
	public void onClose() {
		
	}

}
