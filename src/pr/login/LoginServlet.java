package pr.login;

import java.io.IOException;
import java.util.Date;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import pr.common.Encryptor;
import pr.model.Tuser;
import pr.server.Server;
import pr.server.tools.Tools;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;
 
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        String user = request.getParameter("user");
        String pwd = request.getParameter("pwd");
        
        Encryptor encryptor = new Encryptor();
        Tuser tUser = Tools.checkUser(user, encryptor.encrypt(pwd));
        if(tUser != null) {
            HttpSession session = request.getSession();
            session.setAttribute("user", tUser.getUn());
            session.setAttribute("userId", tUser.getIduser());
            //setting session to expiry in 5 mins
            session.setMaxInactiveInterval(5*60);
            Cookie userName = new Cookie("user", user);
            userName.setMaxAge(5*60);
            response.addCookie(userName);
            response.sendRedirect("arm.html");
            System.out.println("User " + tUser.getUn() + " connect at " + new Date(System.currentTimeMillis()) + 
            		". Now " + (Server.getUsers().size() + 1) + " users.");
        } else {
        	HttpServletResponse res = (HttpServletResponse) response;
        	res.sendRedirect("login.html");
        }
    }
}