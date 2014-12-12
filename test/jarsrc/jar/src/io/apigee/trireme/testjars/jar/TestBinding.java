package io.apigee.trireme.testjars.jar;

import io.apigee.trireme.core.InternalNodeModule;
import io.apigee.trireme.core.NodeRuntime;
import io.apigee.trireme.testjars.dependency.Dependency;
import org.mozilla.javascript.Context;
import org.mozilla.javascript.Scriptable;
import org.mozilla.javascript.ScriptableObject;
import org.mozilla.javascript.annotations.JSFunction;

import java.lang.reflect.InvocationTargetException;

public class TestBinding
implements InternalNodeModule
{
  @Override
  public String getModuleName() {
    return "test-jar-module-internal";
  }

  @Override
  public Scriptable registerExports(Context cx, Scriptable global, NodeRuntime runtime)
    throws InvocationTargetException, IllegalAccessException, InstantiationException
  {
    ScriptableObject.defineClass(global, InternalModuleImpl.class);
    return cx.newObject(global, InternalModuleImpl.CLASS_NAME);
  }

  public static class InternalModuleImpl
  extends ScriptableObject
  {
    public static final String CLASS_NAME = "_testInternalJarClass";

    private String value = "Initial Value";

    @Override
    public String getClassName() {
      return CLASS_NAME;
    }

    @JSFunction
    public void setValue(String val1)
    {
      value = val1;
    }

    @JSFunction
    public String getValue()
    {
      return value;
    }
  }
}
