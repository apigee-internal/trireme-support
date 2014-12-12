package io.apigee.trireme.testjars.jar;

import io.apigee.trireme.core.NodeScriptModule;

public class TestScriptModule
    implements NodeScriptModule
{
    public String[][] getScriptSources() {
      return new String[][] {
          { "test-script-module", "/scripts/scriptmodule.js" }
      };
    }
}
