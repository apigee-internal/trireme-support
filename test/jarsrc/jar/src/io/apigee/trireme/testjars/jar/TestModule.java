package io.apigee.trireme.testjars.jar;

import io.apigee.trireme.core.NodeModule;
import io.apigee.trireme.core.NodeRuntime;
import io.apigee.trireme.core.Utils;
import io.apigee.trireme.testjars.dependency.Dependency;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Function;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.Undefined;
import org.mozilla.javascript.annotations.JSFunction;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.IOException;
import java.io.Reader;
import java.lang.reflect.InvocationTargetException;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLConnection;
import java.util.concurrent.Executors;
import java.util.concurrent.ExecutorService;

public class TestModule
    implements NodeModule
{
    @Override
    public String getModuleName() {
        return "test-jar-module";
    }

    @Override
    public Scriptable registerExports(Context cx, Scriptable global, NodeRuntime runtime)
      throws InvocationTargetException, IllegalAccessException, InstantiationException
    {
        ScriptableObject.defineClass(global, TestModuleImpl.class);
        TestModuleImpl mod = (TestModuleImpl)cx.newObject(global, TestModuleImpl.CLASS_NAME);
        mod.init(runtime);
        return mod;
    }

    public static class TestModuleImpl
        extends ScriptableObject
    {
        public static final String CLASS_NAME = "_testJarClass";

        private final Dependency data = new Dependency();
        private final ExecutorService threadPool;

        private NodeRuntime runtime;

        public TestModuleImpl()
        {
          threadPool = Executors.newCachedThreadPool();
        }

        public void init(NodeRuntime runtime)
        {
          this.runtime = runtime;
        }

        @Override
        public String getClassName() {
            return CLASS_NAME;
        }

        @JSFunction
        public void setValue(String val1)
        {
                data.setValue(val1);
        }

        @JSFunction
        public String getValue()
        {
            return data.getValue();
        }

        @JSFunction
        public void setSharedValue(int val)
        {
            Dependency.setSharedVal(val);
        }

        @JSFunction
        public int getSharedValue()
        {
            return Dependency.getSharedVal();
        }

        @JSFunction
        public void httpGet(final String u, final Function cb)
        {
          final Context cx = Context.getCurrentContext();

          threadPool.submit(new Runnable() {
            public void run() {
              try {
                StringBuilder sb = new StringBuilder();
                URL url = new URL(u);
                HttpURLConnection conn = (HttpURLConnection)url.openConnection();
                conn.connect();
                InputStream in = conn.getInputStream();
                try {
                  Reader rdr = new InputStreamReader(in);
                  int count;
                  char[] tmp = new char[1024];

                  do {
                    count = rdr.read(tmp);
                    if (count > 0) {
                      sb.append(tmp, 0, count);
                    }
                  } while (count > 0);

                } finally {
                  conn.disconnect();
                  in.close();
                }

                runtime.enqueueCallback(cb, cb, TestModuleImpl.this,
                  new Object[] { Undefined.instance, sb.toString() });

              } catch (IOException ioe) {
                runtime.enqueueCallback(cb, cb, TestModuleImpl.this,
                  new Object[] { Utils.makeError(Context.getCurrentContext(), TestModuleImpl.this, "I/O error: " + ioe) });
              }
            }
          });
        }
    }
}
