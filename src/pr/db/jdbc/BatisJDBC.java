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
				session = ConnectDB.getPostgressDB().getSqlSessionFactory().openSession(true);
				return iBatis.getResult(session);
			} catch (Exception e) {
				e.printStackTrace();
				ConnectDB.setPostgressDB(null);
			} finally {
				if (session != null) session.close();
			}
			count++;
		}
		return null;
	}
}