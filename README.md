# trireme-support

This is a module for use with the "trireme" runtime for Node.js.
Trireme is a project that allows Node.js applications to be embedded inside
a Java Virtual Machine with no native code.

For more on Trireme, see it on [NPM](https://www.npmjs.com/package/trireme)
and [GitHub](https://github.com/apigee/trireme).

Although this module can be loaded in any Node.js app, it only makes sense
for apps that run inside the Java Virtual Machine using Trireme. If your
app does not use Trireme, then there's nothing to see here.

## Features of this module

This module lets Node.js applications take advantage of features specific
to Trireme. Currently there is only one feature supported -- loading
Node.js modules built in Java.

## Checking if Trireme is in use

In order to make it possible to make this module inside any Node app,
the module itself does not actually use any Trireme-specific features
unless it is actually running there.

To check if the module is running on Trireme, call "isTrireme()":

    var trireme = require('trireme-support');
    if (trireme.isTrireme()) {
      console.log('We are running on Trireme.');
    }

## JAR file loading

Trireme implements various interfaces that allow a Node.js module to be built
in Java. The following samples in GitHub show the easiest way to build such a
module:

[https://github.com/apigee/trireme/tree/master/samples](https://github.com/apigee/trireme/tree/master/samples)

The actual loading is handled by a function called "loadJars". For a parameter,
it takes an array of file names. Each file name must be a name of an actual
JAR file that is readable by the Trireme script, as any other Node.js file
would be readable.

For instance, if the script is run in a directory called "lib", which has
a sibling directory called "jars", and the script needed to load two JAR
files, it would be invoked like this:

    var path = require('path');
    var trireme = require('trireme-support');
    trireme.loadJars([path.join(__dirname, '../lib/jarA.jar'),
                      path.join(__dirname, '../lib/jarB.jar')]);

When "loadJars" is called, it will do the following:

1) Check to see if all the JAR files are readable, and throw an
exception otherwise.
2) Create a classloader that contains all the specified JARs.
3) Using the classloader from the previous step, look for classes
that implement the "NodeModule" and "NodeScriptModule" interfaces,
and make those modules available to the current script.

(Step 3 is implemented using the "java.util.ServiceLoader" package,
so classes that implement NodeModule must also be listed in
a file in META-INF/services. The sample JAR files in the Trireme
samples repo show how to do this.)

Once step 3 is complete, any Java modules found in the JAR may be
loaded using "require."
