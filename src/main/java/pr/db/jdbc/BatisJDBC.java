package pr.db.jdbc;

import org.apache.ibatis.session.SqlSession;

import pr.db.ConnectDB;

public class BatisJDBC {
	private static final int MAX_REPET = 3;
	private IBatisJDBC iBatis;
	private int count;
	
	public BatisJDBC(IBatisJDBC iBatis) {
		this.iBatis = iBatis;
	}
	
	public Object get() {
		while (count < MAX_REPET) {
			SqlSession session = null;
			try {
				while(ConnectDB.getPostgressDB() == null) {
					Thread.sleep(1000);
				}
				session = ConnectDB.getPostgressDB().getSqlSessionFactory().openSession(true);
				try {
					return iBatis.getResult(session);
				} catch (Exception e) {
					System.out.println("Error!!! (In BatisJDBC.class)");
				}
			} catch (Exception e) {
//				e.printStackTrace();
				System.out.println("Reconnect!!! (In BatisJDBC.class)");
				ConnectDB.setPostgressDB(null);
			} finally {
				if (session != null) session.close();
			}
			count++;
		}
		return null;
	}
}