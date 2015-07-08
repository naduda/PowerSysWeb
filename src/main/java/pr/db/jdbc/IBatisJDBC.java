package pr.db.jdbc;

import java.rmi.RemoteException;
import org.apache.ibatis.session.SqlSession;

public interface IBatisJDBC {
	Object getResult(SqlSession session) throws RemoteException;
}
