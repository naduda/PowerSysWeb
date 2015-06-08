package pr.login;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.annotation.WebFilter;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
 
@WebFilter("/AuthenticationFilter")
public class AuthenticationFilter implements Filter {
    public void init(FilterConfig fConfig) throws ServletException {
        System.out.println("AuthenticationFilter initialized");
    }
     
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse res = (HttpServletResponse) response;
         
        String uri = req.getRequestURI();
         
        HttpSession session = req.getSession(false);
        if(session == null && !(uri.endsWith("login.html") || uri.endsWith("LoginServlet") || (!uri.endsWith(".html") && (uri.indexOf(".") > 0)))) {
            res.sendRedirect("login.html");
        } else {
        	chain.doFilter(request, response);
        }
    }
    
    public void destroy() {}
}
//$ mvn archetype:generate -DgroupId=com.mkyong -DartifactId=CounterWebApp -DarchetypeArtifactId=maven-archetype-webapp -DinteractiveMode=false
//