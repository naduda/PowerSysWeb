package pr.db.jdbc;

import java.util.Map;

import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.SelectProvider;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.Configuration;
import org.apache.ibatis.session.SqlSessionFactory;
import org.apache.ibatis.session.SqlSessionFactoryBuilder;
import org.apache.ibatis.transaction.TransactionFactory;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;

import pr.db.jdbc.mappers.IMapper;
import pr.db.jdbc.mappers.IMapperAction;
import pr.db.jdbc.mappers.IMapperSP;
import pr.db.jdbc.mappers.IMapperT;
import pr.db.jdbc.mappers.IMapperV;

public class PostgresDB {
	private DataSource dataSource;
	private SqlSessionFactory sqlSessionFactory;
	
	public PostgresDB() {
		System.out.println("PostgresDB created");
	}
	
	public PostgresDB (String dataSourceName) {	
		try {	
			InitialContext ctx = new InitialContext();
			dataSource = (DataSource) ctx.lookup(dataSourceName);
			setMappers(dataSource);
		} catch (Exception e) {
			e.printStackTrace();
		}
	}
	
	private void setMappers(DataSource dataSource) {
		TransactionFactory transactionFactory = new JdbcTransactionFactory();
		Environment environment = new Environment("development", transactionFactory, dataSource);
		Configuration configuration = new Configuration(environment);
		configuration.addMapper(IMapper.class);
		configuration.addMapper(IMapperAction.class);
		configuration.addMapper(IMapperSP.class);
		configuration.addMapper(IMapperT.class);
		configuration.addMapper(IMapperV.class);
		//configuration.addMappers("jdbc.mappers");
		configuration.addMapper(BaseMapper.class);
		sqlSessionFactory = new SqlSessionFactoryBuilder().build(configuration);
	}
	
	public SqlSessionFactory getSqlSessionFactory() {
		return sqlSessionFactory;
	}
//	=============================================================================================
	public static String getQuery(Map<String, Object> params) {
        return params.get("query").toString();
    }

    public interface BaseMapper {
        @SelectProvider(type = PostgresDB.class, method = "getQuery")
        void update(@Param("query") String query);
    }
}
