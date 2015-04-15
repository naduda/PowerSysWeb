package pr.db.jdbc.mappers;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.MapKey;
import org.apache.ibatis.annotations.Select;

import pr.model.SPunit;
import pr.model.SpTuCommand;
import pr.model.SpTypeSignal;

public interface IMapperSP {

	@Select("select * from sp_unit")
	@MapKey("idunit")
	Map<Integer, SPunit> getSPunitMap();
	
	@Select("select * from sp_tu_command")
	List<SpTuCommand> getSpTuCommand();
	
	@Select("select * from sp_typesignal")
	@MapKey("idtypesignal")
	Map<Integer, SpTypeSignal> getSpTypeSignalMap();
}
