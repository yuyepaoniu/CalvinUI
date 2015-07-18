<%@ WebHandler Language="C#" Class="bottomloaded" %>

using System;
using System.Web;
using System.IO;

public class bottomloaded : IHttpHandler {

    static int i = 0;


    public void ProcessRequest(HttpContext context)
    {
        System.Threading.Thread.Sleep(2000);
        context.Response.ContentType = "text/plain";
        StreamReader reader = new StreamReader(context.Request.InputStream);
        string ss = reader.ReadToEnd();

        context.Response.Write("<li>" + i + "加载</li><li>" + i + "加载</li>");
        i++;
    }
 
    public bool IsReusable {
        get {
            return false;
        }
    }

}