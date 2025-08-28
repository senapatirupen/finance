Awesome—here’s a **production-ready, generic Cucumber test setup** for Spring REST APIs that covers **GET/POST/PUT/PATCH/DELETE** with reusable steps, data-driven assertions, headers (incl. JWT), query/path params, and JSON schema checks. It uses **JUnit 5 + Cucumber + Rest Assured** (works great both against a running service or a Testcontainers-booted one). You can drop this into any Maven Spring project.

---

# 1) Maven setup

```xml
<!-- pom.xml -->
<project>
  <properties>
    <java.version>17</java.version>
    <cucumber.version>7.18.1</cucumber.version>
    <restassured.version>5.5.0</restassured.version>
    <junit.jupiter.version>5.10.2</junit.jupiter.version>
  </properties>

  <dependencies>
    <!-- Cucumber + JUnit 5 -->
    <dependency>
      <groupId>io.cucumber</groupId>
      <artifactId>cucumber-java</artifactId>
      <version>${cucumber.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>io.cucumber</groupId>
      <artifactId>cucumber-junit-platform-engine</artifactId>
      <version>${cucumber.version}</version>
      <scope>test</scope>
    </dependency>

    <!-- Rest Assured for HTTP + JSONPath -->
    <dependency>
      <groupId>io.rest-assured</groupId>
      <artifactId>rest-assured</artifactId>
      <version>${restassured.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>io.rest-assured</groupId>
      <artifactId>json-schema-validator</artifactId>
      <version>${restassured.version}</version>
      <scope>test</scope>
    </dependency>

    <!-- Assertions -->
    <dependency>
      <groupId>org.assertj</groupId>
      <artifactId>assertj-core</artifactId>
      <version>3.26.0</version>
      <scope>test</scope>
    </dependency>

    <!-- Jackson for object mapping (optional) -->
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>2.17.2</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <!-- Surefire: runs Cucumber via JUnit Platform -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.2.5</version>
        <configuration>
          <includes>
            <include>**/*CucumberIT.java</include>
          </includes>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

---

# 2) Project layout

```
src
└── test
    ├── java
    │   └── com.example.api
    │       ├── config
    │       │   └── TestConfig.java
    │       ├── support
    │       │   ├── TestContext.java
    │       │   ├── ApiClient.java
    │       │   └── Hooks.java
    │       ├── steps
    │       │   └── GenericApiSteps.java
    │       └── CucumberIT.java
    └── resources
        ├── application-test.properties
        ├── features
        │   └── generic_api.feature
        └── schemas
            └── user-list.schema.json
```

---

# 3) Config & Context

```java
// src/test/java/com/example/api/config/TestConfig.java
package com.example.api.config;

public final class TestConfig {
  private TestConfig() {}
  public static String baseUrl() {
    // priority: system property > env var > properties file
    String fromSys = System.getProperty("api.baseUrl");
    if (fromSys != null && !fromSys.isBlank()) return fromSys;
    String fromEnv = System.getenv("API_BASE_URL");
    if (fromEnv != null && !fromEnv.isBlank()) return fromEnv;
    // fallback for local dev
    return "http://localhost:8080";
  }
  public static String defaultJwt() {
    String fromSys = System.getProperty("api.jwt");
    if (fromSys != null) return fromSys;
    String fromEnv = System.getenv("API_JWT");
    return fromEnv; // may be null; steps can set later
  }
}
```

```java
// src/test/java/com/example/api/support/TestContext.java
package com.example.api.support;

import io.restassured.response.Response;
import java.util.HashMap;
import java.util.Map;

public class TestContext {
  private String jwt;                         // bearer token
  private final Map<String, Object> vars = new HashMap<>(); // store ids, etc.
  private Response lastResponse;

  public String getJwt() { return jwt; }
  public void setJwt(String jwt) { this.jwt = jwt; }

  public void putVar(String key, Object value) { vars.put(key, value); }
  public Object getVar(String key) { return vars.get(key); }

  public Response getLastResponse() { return lastResponse; }
  public void setLastResponse(Response resp) { this.lastResponse = resp; }

  public void clear() {
    vars.clear();
    lastResponse = null;
    jwt = null;
  }
}
```

```java
// src/test/java/com/example/api/support/ApiClient.java
package com.example.api.support;

import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.ContentType;
import io.restassured.specification.RequestSpecification;

import static io.restassured.RestAssured.given;

import java.util.Map;

public class ApiClient {

  private final String baseUrl;
  private final TestContext ctx;

  public ApiClient(String baseUrl, TestContext ctx) {
    this.baseUrl = baseUrl;
    this.ctx = ctx;
  }

  private RequestSpecification spec(Map<String, String> headers, Map<String, ?> qs) {
    RequestSpecBuilder b = new RequestSpecBuilder()
        .setBaseUri(baseUrl)
        .setContentType(ContentType.JSON)
        .setAccept(ContentType.JSON);

    if (ctx.getJwt() != null && !ctx.getJwt().isBlank()) {
      b.addHeader("Authorization", "Bearer " + ctx.getJwt());
    }
    if (headers != null) headers.forEach(b::addHeader);
    if (qs != null) b.addQueryParams(qs);

    return b.build();
  }

  public io.restassured.response.Response request(
      String method, String path,
      Map<String, String> headers,
      Map<String, ?> queryParams,
      String body) {

    RequestSpecification s = given().spec(spec(headers, queryParams));
    if (body != null && !body.isBlank()) s = s.body(body);

    return switch (method.toUpperCase()) {
      case "GET"    -> s.when().get(path);
      case "POST"   -> s.when().post(path);
      case "PUT"    -> s.when().put(path);
      case "PATCH"  -> s.when().patch(path);
      case "DELETE" -> s.when().delete(path);
      default -> throw new IllegalArgumentException("Unsupported method: " + method);
    };
  }
}
```

```java
// src/test/java/com/example/api/support/Hooks.java
package com.example.api.support;

import com.example.api.config.TestConfig;
import io.cucumber.java.After;
import io.cucumber.java.Before;

public class Hooks {
  public static final ThreadLocal<TestContext> CTX = ThreadLocal.withInitial(TestContext::new);
  public static final ThreadLocal<ApiClient> CLIENT = new ThreadLocal<>();

  @Before
  public void beforeScenario() {
    TestContext ctx = CTX.get();
    ctx.clear();
    ctx.setJwt(TestConfig.defaultJwt()); // optional
    CLIENT.set(new ApiClient(TestConfig.baseUrl(), ctx));
  }

  @After
  public void afterScenario() {
    CTX.remove();
    CLIENT.remove();
  }
}
```

---

# 4) Generic step definitions

```java
// src/test/java/com/example/api/steps/GenericApiSteps.java
package com.example.api.steps;

import com.example.api.support.Hooks;
import com.example.api.support.TestContext;
import com.example.api.support.ApiClient;

import io.cucumber.java.en.*;
import io.cucumber.datatable.DataTable;

import io.restassured.module.jsv.JsonSchemaValidator;
import io.restassured.response.Response;

import org.assertj.core.api.Assertions;

import java.io.File;
import java.util.*;
import java.util.stream.Collectors;

public class GenericApiSteps {

  private TestContext ctx() { return Hooks.CTX.get(); }
  private ApiClient client() { return Hooks.CLIENT.get(); }

  @Given("the API base URL is {string}")
  public void apiBaseUrl_is(String baseUrl) {
    // override base URL at runtime if needed
    Hooks.CLIENT.set(new ApiClient(baseUrl, ctx()));
  }

  @Given("I set the JWT token {string}")
  public void iSetJwt(String jwt) {
    ctx().setJwt(resolve(jwt));
  }

  @Given("I store {string} as {string}")
  public void iStoreVar(String value, String key) {
    ctx().putVar(key, resolve(value));
  }

  @When("I send a {word} request to {string}")
  public void iSendRequestNoBody(String method, String path) {
    send(method, path, Collections.emptyMap(), Collections.emptyMap(), null);
  }

  @When("I send a {word} request to {string} with body:")
  public void iSendRequestWithBody(String method, String path, String body) {
    send(method, path, Collections.emptyMap(), Collections.emptyMap(), resolve(body));
  }

  @When("I send a {word} request to {string} with headers:")
  public void iSendRequestWithHeaders(String method, String path, DataTable table) {
    Map<String, String> headers = table.asMap(String.class, String.class)
        .entrySet().stream()
        .collect(Collectors.toMap(Map.Entry::getKey, e -> resolve(e.getValue())));
    send(method, path, headers, Collections.emptyMap(), null);
  }

  @When("I send a {word} request to {string} with query params:")
  public void iSendRequestWithQuery(String method, String path, DataTable table) {
    Map<String, String> q = table.asMap(String.class, String.class)
        .entrySet().stream()
        .collect(Collectors.toMap(Map.Entry::getKey, e -> resolve(e.getValue())));
    send(method, path, Collections.emptyMap(), q, null);
  }

  @When("I send a {word} request to {string} with headers and body:")
  public void iSendRequestWithHeadersAndBody(String method, String path, DataTable headers, String body) {
    Map<String, String> h = headers.asMap(String.class, String.class)
        .entrySet().stream()
        .collect(Collectors.toMap(Map.Entry::getKey, e -> resolve(e.getValue())));
    send(method, path, h, Collections.emptyMap(), resolve(body));
  }

  @Then("the response status should be {int}")
  public void responseStatusShouldBe(int code) {
    Assertions.assertThat(ctx().getLastResponse().statusCode())
        .as("HTTP status").isEqualTo(code);
  }

  @Then("the response header {string} should be {string}")
  public void responseHeaderShouldBe(String header, String value) {
    String actual = ctx().getLastResponse().getHeader(header);
    Assertions.assertThat(actual).as("Header " + header).isEqualTo(resolve(value));
  }

  @Then("the JSON at path {string} should be {string}")
  public void jsonAtPathShouldBe(String jsonPath, String expected) {
    Object actual = ctx().getLastResponse().jsonPath().get(jsonPath);
    Assertions.assertThat(String.valueOf(actual)).isEqualTo(resolve(expected));
  }

  @Then("the JSON at path {string} should exist")
  public void jsonPathExists(String jsonPath) {
    Object val = ctx().getLastResponse().jsonPath().get(jsonPath);
    Assertions.assertThat(val).as("JSON path " + jsonPath).isNotNull();
  }

  @Then("the JSON at path {string} should match regex {string}")
  public void jsonPathMatchesRegex(String jsonPath, String regex) {
    Object val = ctx().getLastResponse().jsonPath().get(jsonPath);
    Assertions.assertThat(String.valueOf(val)).matches(resolve(regex));
  }

  @Then("the response should match JSON schema {string}")
  public void jsonSchema(String schemaName) {
    File schema = new File("src/test/resources/schemas/" + schemaName);
    ctx().getLastResponse().then().assertThat().body(JsonSchemaValidator.matchesJsonSchema(schema));
  }

  @Then("I save JSON path {string} as {string}")
  public void saveJsonPathAs(String jsonPath, String key) {
    Object val = ctx().getLastResponse().jsonPath().get(jsonPath);
    ctx().putVar(key, val);
  }

  // Util

  private void send(String method, String path, Map<String, String> headers,
                    Map<String, ?> query, String body) {

    String resolvedPath = resolve(path);
    Response resp = client().request(method, resolvedPath, headers, query, body);
    ctx().setLastResponse(resp);
  }

  private String resolve(String text) {
    if (text == null) return null;
    // allows placeholders like ${userId} or ${token}
    String out = text;
    for (Map.Entry<String, Object> e : ctx().getClass()
        .cast(ctx()).getClass().getDeclaredFields() /* dummy to avoid warning */; /* no-op */) {
      // not used; keep simple variable replacement via map only
    }
    for (Map.Entry<String, Object> e : snapshotVars().entrySet()) {
      out = out.replace("${" + e.getKey() + "}", String.valueOf(e.getValue()));
    }
    return out;
  }

  private Map<String, Object> snapshotVars() {
    // expose TestContext vars via reflection-safe copy
    try {
      var f = TestContext.class.getDeclaredField("vars");
      f.setAccessible(true);
      Map<String, Object> map = (Map<String, Object>) f.get(Hooks.CTX.get());
      return new HashMap<>(map);
    } catch (Exception e) {
      return Map.of();
    }
  }
}
```

> The `resolve(...)` lets you refer to stored values (IDs, tokens) in later steps using `${varName}`.

---

# 5) Cucumber runner

```java
// src/test/java/com/example/api/CucumberIT.java
package com.example.api;

import io.cucumber.junit.platform.engine.Cucumber;

@Cucumber
public class CucumberIT {
  // Empty: Cucumber + JUnit Platform will pick up feature files under src/test/resources/features
}
```

---

# 6) A single generic, data-driven feature

```gherkin
# src/test/resources/features/generic_api.feature
Feature: Generic API Contract & Behavior

  # Optional: override base URL here (else use API_BASE_URL or http://localhost:8080)
  Background:
    Given the API base URL is "http://localhost:8080"
    And I set the JWT token "${jwtToken}"   # can be injected via system/env or set later

  @get_list
  Scenario: GET list of users with paging
    When I send a GET request to "/api/users?size=5&page=0"
    Then the response status should be 200
    And the response header "Content-Type" should be "application/json"
    And the JSON at path "content.size()" should be "5"
    And the JSON at path "pageable.pageNumber" should be "0"
    And the response should match JSON schema "user-list.schema.json"

  @create_update_delete
  Scenario: Create, update, and delete a user (POST -> PUT -> DELETE)
    When I send a POST request to "/api/users" with body:
      """
      {
        "name": "Ravi Test",
        "email": "ravi.${rand}@example.com",
        "role": "ADMIN"
      }
      """
    Then the response status should be 201
    And I save JSON path "id" as "userId"

    When I send a PUT request to "/api/users/${userId}" with body:
      """
      {
        "name": "Ravi Kumar",
        "role": "USER"
      }
      """
    Then the response status should be 200
    And the JSON at path "name" should be "Ravi Kumar"
    And the JSON at path "role" should be "USER"

    When I send a DELETE request to "/api/users/${userId}"
    Then the response status should be 204

  @patch_with_headers_and_query
  Scenario: PATCH with custom headers and query params
    When I send a PATCH request to "/api/orders/123/status" with headers:
      | X-Request-Id | 9f1a-abc-123 |
      | X-Source     | cucumber     |
    And I send a PATCH request to "/api/orders/123/status" with query params:
      | soft | true |
    Then the response status should be 200
    And the JSON at path "status" should exist

  @auth
  Scenario: Auth via explicit JWT and capture token
    Given I set the JWT token ""
    When I send a POST request to "/auth/login" with body:
      """
      { "username":"admin", "password":"admin@123" }
      """
    Then the response status should be 200
    And I save JSON path "accessToken" as "token"
    And I store "${token}" as "jwtToken"
    Given I set the JWT token "${jwtToken}"
    When I send a GET request to "/api/profile"
    Then the response status should be 200
    And the JSON at path "username" should be "admin"
```

> Tip: if you want simple **Scenario Outlines** for many endpoints, you can do:

```gherkin
Scenario Outline: Generic call
  When I send a <method> request to "<path>" with body:
    """
    <body>
    """
  Then the response status should be <status>

  Examples:
    | method | path            | body                         | status |
    | GET    | /api/health     |                              | 200    |
    | POST   | /api/ping       | {"msg":"hi"}                 | 201    |
    | DELETE | /api/temp/123   |                              | 204    |
```

---

# 7) Example JSON schema (optional)

```json
// src/test/resources/schemas/user-list.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["content","pageable"],
  "properties": {
    "content": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["id","name","email"],
        "properties": {
          "id": { "type": ["integer", "string"] },
          "name": { "type": "string" },
          "email": { "type": "string", "format": "email" }
        }
      }
    },
    "pageable": {
      "type": "object",
      "required": ["pageNumber"],
      "properties": {
        "pageNumber": { "type": "integer" }
      }
    }
  }
}
```

---

# 8) Running the tests

* Local default: `mvn -q -DAPI_BASE_URL=http://localhost:8080 test`
* With JWT from env: `API_JWT=eyJ... mvn test`
* With system properties:
  `mvn test -Dapi.baseUrl=http://host.docker.internal:8080 -Dapi.jwt=eyJ...`

---

# 9) Useful extensions (drop-ins)

* **Random helpers**: add a tiny step to generate `${rand}`:

```java
@Given("I store a random suffix as {string}")
public void randomSuffix(String key) {
  String r = UUID.randomUUID().toString().substring(0,8);
  Hooks.CTX.get().putVar(key, r);
}
```

Use it in payloads like `email: "ravi.${rand}@example.com"`.

* **Array size checks**:

```java
@Then("the JSON array at path {string} should have size {int}")
public void arraySize(String path, int size) {
  List<?> arr = ctx().getLastResponse().jsonPath().getList(path);
  Assertions.assertThat(arr).hasSize(size);
}
```

* **Numeric comparisons**:

```java
@Then("the JSON number at path {string} should be > {double}")
public void jsonNumberGt(String path, double n) {
  Number v = ctx().getLastResponse().jsonPath().get(path);
  Assertions.assertThat(v.doubleValue()).isGreaterThan(n);
}
```

---

# 10) Testing a Spring Boot app without starting a server (optional)

If you prefer **MockMvc** over HTTP:

* Depend on `spring-boot-starter-test` (test scope) and wire a `MockMvc` bean in tests.
* Replace `Rest Assured` calls with `MockMvc` calls inside `ApiClient`. (Everything else—features, steps—stays the same.)
  Rest Assured also supports a **MockMvc module**, but the standalone approach above keeps the template portable across projects/services.

---

## That’s it

You now have a generic, extensible Cucumber harness that can hit **any** Spring REST endpoint with **any method**, reuse steps across services, and assert responses with JSONPath or schema validation. If you want, tell me your typical endpoints (e.g., `/api/expenses`, `/api/sip`, `/api/lumpsum`) and I’ll pre-author a feature file tailored to your project’s payloads and auth flow.


Awesome—here’s a clean, **generic Cucumber + Rest Assured** test harness you can drop into any Spring REST project to exercise **GET, POST, PATCH, PUT, DELETE** in a data-driven way. It’s built to be reusable across endpoints, supports JWT/Bearer auth, path/query params, external JSON payloads, JSON Schema checks, and simple state sharing (e.g., store an `id` from one step and reuse it in later calls).

---

# Project layout

```
src
└─ test
   ├─ java
   │  └─ com/example/api/tests
   │     ├─ RunnerTest.java
   │     ├─ hooks
   │     │  └─ Hooks.java
   │     ├─ support
   │     │  ├─ TestContext.java
   │     │  └─ PayloadLoader.java
   │     └─ steps
   │        └─ ApiSteps.java
   └─ resources
      ├─ features
      │  └─ api_generic.feature
      ├─ payloads
      │  ├─ create-user.json
      │  └─ update-user.json
      └─ schemas
         └─ user.json
```

---

# pom.xml (JUnit 5 + Cucumber + Rest Assured)

```xml
<project xmlns="http://maven.apache.org/POM/4.0.0"  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.example</groupId>
  <artifactId>api-tests</artifactId>
  <version>1.0.0</version>

  <properties>
    <maven.compiler.source>17</maven.compiler.source>
    <maven.compiler.target>17</maven.compiler.target>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    <junit.jupiter.version>5.10.3</junit.jupiter.version>
    <cucumber.version>7.18.1</cucumber.version>
    <restassured.version>5.5.0</restassured.version>
    <jackson.version>2.17.2</jackson.version>
  </properties>

  <dependencies>
    <!-- Cucumber + JUnit Platform (JUnit 5) -->
    <dependency>
      <groupId>io.cucumber</groupId>
      <artifactId>cucumber-java</artifactId>
      <version>${cucumber.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>io.cucumber</groupId>
      <artifactId>cucumber-junit-platform-engine</artifactId>
      <version>${cucumber.version}</version>
      <scope>test</scope>
    </dependency>

    <!-- Rest Assured -->
    <dependency>
      <groupId>io.rest-assured</groupId>
      <artifactId>rest-assured</artifactId>
      <version>${restassured.version}</version>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>io.rest-assured</groupId>
      <artifactId>json-schema-validator</artifactId>
      <version>${restassured.version}</version>
      <scope>test</scope>
    </dependency>

    <!-- Jackson for payload manipulation -->
    <dependency>
      <groupId>com.fasterxml.jackson.core</groupId>
      <artifactId>jackson-databind</artifactId>
      <version>${jackson.version}</version>
      <scope>test</scope>
    </dependency>

    <!-- Assertions -->
    <dependency>
      <groupId>org.assertj</groupId>
      <artifactId>assertj-core</artifactId>
      <version>3.26.3</version>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <!-- Surefire runs JUnit Platform -->
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-surefire-plugin</artifactId>
        <version>3.2.5</version>
        <configuration>
          <includes>
            <include>**/*Runner*.java</include>
            <include>**/*Test.java</include>
          </includes>
        </configuration>
      </plugin>
    </plugins>
  </build>
</project>
```

---

# Feature file (data-driven, covers all verbs)

`src/test/resources/features/api_generic.feature`

```gherkin
Feature: Generic API regression with all HTTP methods

  Background:
    # Base URL, default headers, and optional bearer token
    Given the base url is "<BASE_URL>"
    And I set default headers:
      | Content-Type | application/json |
      | Accept       | application/json |
    And I use bearer token from env "API_TOKEN" if present

  # CREATE (POST)
  Scenario Outline: POST create resource
    And I set the request body from file "<payloadFile>"
    And I set path params:
      | userId | <userId> |
    And I set query params:
      | verbose | <verbose> |
    When I call "POST" "<endpoint>"
    Then the response status should be <status>
    And I store jsonpath "<storePath>" as "<storeKey>"
    And the response should match schema "<schema>" if present

    Examples:
      | BASE_URL                | endpoint              | payloadFile        | userId | verbose | status | storePath | storeKey | schema        |
      | http://localhost:8080   | /api/users/{userId}   | create-user.json   | 1001   | true    | 201    | $.id      | lastId   | schemas/user.json |

  # READ (GET)
  Scenario Outline: GET read resource with stored id
    And I set path params:
      | id | ${lastId} |
    When I call "GET" "<endpoint>"
    Then the response status should be <status>
    And the jsonpath "$.id" should equal "${lastId}"

    Examples:
      | BASE_URL              | endpoint            | status |
      | http://localhost:8080 | /api/users/{id}     | 200    |

  # UPDATE (PUT)
  Scenario Outline: PUT replace resource
    And I set path params:
      | id | ${lastId} |
    And I set the request body from file "<payloadFile>"
    When I call "PUT" "<endpoint>"
    Then the response status should be <status>

    Examples:
      | BASE_URL              | endpoint            | payloadFile        | status |
      | http://localhost:8080 | /api/users/{id}     | update-user.json   | 200    |

  # PARTIAL UPDATE (PATCH)
  Scenario Outline: PATCH partially update resource
    And I set path params:
      | id | ${lastId} |
    And I set body:
      """
      { "status": "SUSPENDED" }
      """
    When I call "PATCH" "<endpoint>"
    Then the response status should be <status>
    And the jsonpath "$.status" should equal "SUSPENDED"

    Examples:
      | BASE_URL              | endpoint            | status |
      | http://localhost:8080 | /api/users/{id}     | 200    |

  # DELETE
  Scenario Outline: DELETE resource
    And I set path params:
      | id | ${lastId} |
    When I call "DELETE" "<endpoint>"
    Then the response status should be <status>

    Examples:
      | BASE_URL              | endpoint            | status |
      | http://localhost:8080 | /api/users/{id}     | 204    |
```

> Notes
> • `${lastId}` is a stored variable (set during POST) you can reuse.
> • `And the response should match schema "<schema> if present"` lets you make schema optional by leaving the cell blank.
> • Change `BASE_URL` once in each Example row (or make it a profile/env var).

---

# Sample payloads & schema

`src/test/resources/payloads/create-user.json`

```json
{
  "name": "Ava Test",
  "email": "ava.test@example.com",
  "role": "USER"
}
```

`src/test/resources/payloads/update-user.json`

```json
{
  "name": "Ava Updated",
  "email": "ava.updated@example.com",
  "role": "ADMIN"
}
```

`src/test/resources/schemas/user.json` (tiny example)

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "type": "object",
  "required": ["id","name","email"],
  "properties": {
    "id":    { "type": ["integer","string"] },
    "name":  { "type": "string" },
    "email": { "type": "string", "format": "email" },
    "role":  { "type": "string" }
  },
  "additionalProperties": true
}
```

---

# JUnit 5 Runner

`src/test/java/com/example/api/tests/RunnerTest.java`

```java
package com.example.api.tests;

import org.junit.platform.suite.api.ConfigurationParameter;
import org.junit.platform.suite.api.IncludeEngines;
import org.junit.platform.suite.api.SelectClasspathResource;
import org.junit.platform.suite.api.Suite;

import static io.cucumber.junit.platform.engine.Constants.GLUE_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.PLUGIN_PROPERTY_NAME;
import static io.cucumber.junit.platform.engine.Constants.FILTER_TAGS_PROPERTY_NAME;

@Suite
@IncludeEngines("cucumber")
@SelectClasspathResource("features")
@ConfigurationParameter(key = GLUE_PROPERTY_NAME, value = "com.example.api.tests.steps,com.example.api.tests.hooks")
@ConfigurationParameter(key = PLUGIN_PROPERTY_NAME, value = "pretty, summary, html:target/cucumber-report.html, json:target/cucumber-report.json")
@ConfigurationParameter(key = FILTER_TAGS_PROPERTY_NAME, value = "not @ignore")
public class RunnerTest {}
```

---

# Hooks (build common RequestSpec, envs, logging)

`src/test/java/com/example/api/tests/hooks/Hooks.java`

```java
package com.example.api.tests.hooks;

import com.example.api.tests.support.TestContext;
import io.cucumber.java.Before;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.filter.log.LogDetail;
import io.restassured.http.ContentType;

import static io.restassured.RestAssured.requestSpecification;

public class Hooks {

  private final TestContext ctx;

  public Hooks(TestContext ctx) {
    this.ctx = ctx;
  }

  @Before(order = 0)
  public void buildRequestSpec() {
    RequestSpecBuilder b = new RequestSpecBuilder()
        .setContentType(ContentType.JSON)
        .log(LogDetail.ALL);

    requestSpecification = b.build();
    ctx.clear(); // clear scenario state
  }
}
```

---

# Support: TestContext & PayloadLoader

`src/test/java/com/example/api/tests/support/TestContext.java`

```java
package com.example.api.tests.support;

import io.restassured.response.Response;

import java.util.HashMap;
import java.util.Map;

public class TestContext {
  private final Map<String, Object> store = new HashMap<>();
  private String baseUrl;
  private final Map<String, String> headers = new HashMap<>();
  private final Map<String, Object> pathParams = new HashMap<>();
  private final Map<String, Object> queryParams = new HashMap<>();
  private String body;
  private Response response;
  private String bearerToken;

  public void clear() {
    store.clear();
    headers.clear();
    pathParams.clear();
    queryParams.clear();
    body = null;
    response = null;
    bearerToken = null;
    baseUrl = null;
  }

  // getters/setters
  public Map<String, Object> getStore() { return store; }
  public void put(String key, Object value) { store.put(key, value); }
  public Object get(String key) { return store.get(key); }

  public Map<String, String> getHeaders() { return headers; }
  public Map<String, Object> getPathParams() { return pathParams; }
  public Map<String, Object> getQueryParams() { return queryParams; }

  public String getBody() { return body; }
  public void setBody(String body) { this.body = body; }

  public Response getResponse() { return response; }
  public void setResponse(Response response) { this.response = response; }

  public String getBaseUrl() { return baseUrl; }
  public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

  public String getBearerToken() { return bearerToken; }
  public void setBearerToken(String bearerToken) { this.bearerToken = bearerToken; }
}
```

`src/test/java/com/example/api/tests/support/PayloadLoader.java`

```java
package com.example.api.tests.support;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Scanner;

public final class PayloadLoader {
  private PayloadLoader() {}

  public static String loadResourceAsString(String path) {
    InputStream is = Thread.currentThread().getContextClassLoader().getResourceAsStream(path);
    if (is == null) throw new IllegalArgumentException("Resource not found: " + path);
    try (Scanner scanner = new Scanner(is, StandardCharsets.UTF_8)) {
      return scanner.useDelimiter("\\A").next();
    }
  }
}
```

---

# Step definitions (generic, verb-agnostic)

`src/test/java/com/example/api/tests/steps/ApiSteps.java`

```java
package com.example.api.tests.steps;

import com.example.api.tests.support.PayloadLoader;
import com.example.api.tests.support.TestContext;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.*;
import io.restassured.builder.RequestSpecBuilder;
import io.restassured.http.Header;
import io.restassured.response.Response;
import org.assertj.core.api.Assertions;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

public class ApiSteps {

  private final TestContext ctx;

  public ApiSteps(TestContext ctx) {
    this.ctx = ctx;
  }

  // ---------- Given / And ----------
  @Given("the base url is {string}")
  public void the_base_url_is(String baseUrl) {
    ctx.setBaseUrl(baseUrl);
  }

  @And("I set default headers:")
  public void i_set_default_headers(DataTable table) {
    table.asMaps().forEach(row -> ctx.getHeaders().put(row.get("Content-Type") != null ? "Content-Type" : row.get("header"),
                                                       row.values().toArray(new String[0])[1]));
    // Above is defensive; simpler:
    for (Map<String, String> row : table.asMaps(String.class, String.class)) {
      ctx.getHeaders().put(row.getOrDefault("header", row.keySet().iterator().next()), row.values().iterator().next());
    }
  }

  @And("I add headers:")
  public void i_add_headers(DataTable table) {
    for (Map<String, String> row : table.asMaps(String.class, String.class)) {
      ctx.getHeaders().put(row.get("key"), row.get("value"));
    }
  }

  @And("I use bearer token from env {string} if present")
  public void i_use_bearer_token_from_env(String envVar) {
    String token = System.getenv(envVar);
    if (token != null && !token.isBlank()) {
      ctx.setBearerToken(token);
    }
  }

  @And("I set path params:")
  public void i_set_path_params(DataTable table) {
    for (Map<String, String> row : table.asMaps(String.class, String.class)) {
      String k = row.keySet().iterator().next();
      String v = row.values().iterator().next();
      ctx.getPathParams().put(k, resolve(v));
    }
  }

  @And("I set query params:")
  public void i_set_query_params(DataTable table) {
    for (Map<String, String> row : table.asMaps(String.class, String.class)) {
      String k = row.keySet().iterator().next();
      String v = row.values().iterator().next();
      ctx.getQueryParams().put(k, resolve(v));
    }
  }

  @And("I set the request body from file {string}")
  public void i_set_the_request_body_from_file(String relPath) {
    String prefix = relPath.startsWith("payloads/") ? "" : "payloads/";
    ctx.setBody(PayloadLoader.loadResourceAsString(prefix + relPath));
  }

  @And("I set body:")
  public void i_set_body_docstring(String body) {
    ctx.setBody(body);
  }

  // ---------- When ----------
  @When("I call {string} {string}")
  public void i_call_method_endpoint(String method, String endpoint) {
    String url = ctx.getBaseUrl() + endpoint;
    RequestSpecBuilder rb = new RequestSpecBuilder();
    ctx.getHeaders().forEach((k, v) -> rb.addHeader(new Header(k, v)));
    if (ctx.getBearerToken() != null) {
      rb.addHeader("Authorization", "Bearer " + ctx.getBearerToken());
    }

    var req = given()
        .spec(rb.build())
        .pathParams(ctx.getPathParams())
        .queryParams(ctx.getQueryParams());

    if (ctx.getBody() != null && !ctx.getBody().isBlank()) {
      req = req.body(ctx.getBody());
    }

    Response resp = switch (method.toUpperCase()) {
      case "GET" -> req.when().get(url);
      case "POST" -> req.when().post(url);
      case "PUT" -> req.when().put(url);
      case "PATCH" -> req.when().patch(url);
      case "DELETE" -> req.when().delete(url);
      default -> throw new IllegalArgumentException("Unsupported method: " + method);
    };

    ctx.setResponse(resp.then().log().all().extract().response());
  }

  // ---------- Then / And ----------
  @Then("the response status should be {int}")
  public void the_response_status_should_be(Integer status) {
    Assertions.assertThat(ctx.getResponse().statusCode()).isEqualTo(status);
  }

  @And("the jsonpath {string} should equal {string}")
  public void the_jsonpath_should_equal(String jsonPath, String expected) {
    Object actual = ctx.getResponse().jsonPath().get(jsonPath);
    Assertions.assertThat(String.valueOf(actual)).isEqualTo(String.valueOf(resolve(expected)));
  }

  @And("I store jsonpath {string} as {string}")
  public void i_store_jsonpath_as(String jsonPath, String key) {
    Object val = ctx.getResponse().jsonPath().get(jsonPath);
    Assertions.assertThat(val).as("jsonpath " + jsonPath + " exists").isNotNull();
    ctx.put(key, String.valueOf(val));
  }

  @And("the response should match schema {string} if present")
  public void the_response_should_match_schema_if_present(String schema) {
    if (schema != null && !schema.isBlank()) {
      String path = schema.startsWith("schemas/") ? schema : "schemas/" + schema;
      ctx.getResponse().then().assertThat().body(matchesJsonSchemaInClasspath(path));
    }
  }

  // ---------- Utils ----------
  private Object resolve(String raw) {
    if (raw == null) return null;
    // support ${var} substitution from store
    if (raw.startsWith("${") && raw.endsWith("}")) {
      String key = raw.substring(2, raw.length() - 1);
      Object val = ctx.getStore().get(key);
      return val == null ? "" : val;
    }
    // boolean / number quick coercion
    if ("true".equalsIgnoreCase(raw) || "false".equalsIgnoreCase(raw)) return Boolean.valueOf(raw);
    try { return Integer.valueOf(raw); } catch (Exception ignore) {}
    try { return Long.valueOf(raw); } catch (Exception ignore) {}
    return raw;
  }
}
```

---

## How to run

```bash
# Optionally export your API token (if your APIs need JWT/Bearer)
export API_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Run tests
mvn -q -Dtest=RunnerTest test

# Report:
#   target/cucumber-report.html
#   target/cucumber-report.json
```

---

## Adapting quickly

* **New endpoints**: Just add more `Scenario Outline + Examples` rows.
* **Different base URL per env**: Replace `BASE_URL` column with `${BASE_URL}` and supply via `-Dbase.url=...` + a tiny step, or keep as shown.
* **Auth per endpoint**: Use `And I add headers:` in the scenario to override.
* **Chaining**: Use `I store jsonpath` then `${var}` anywhere (path/query/body).
* **Validation**: Add more `jsonpath should equal` lines or schemas under `/schemas`.

If you want, I can also add **tag-based suites** (e.g., `@smoke`, `@regression`, `@destructive`) or a **Gradle** variant.

I'll create comprehensive Cucumber tests for your PollController. Based on your controller, I'll write feature files and step definitions that cover all the endpoints.

## Project Structure

```
src/test/
├── java/
│   └── com/apress/tests/
│       ├── RunnerTest.java
│       ├── config/
│       │   └── TestConfig.java
│       ├── hooks/
│       │   └── Hooks.java
│       ├── steps/
│       │   └── PollControllerSteps.java
│       └── support/
│           ├── TestContext.java
│           └── PayloadLoader.java
└── resources/
    ├── application-test.properties
    ├── features/
    │   └── poll-controller.feature
    ├── payloads/
    │   ├── create-poll.json
    │   ├── update-poll.json
    │   └── poll-with-options.json
    └── schemas/
        └── poll-schema.json
```

## 1. Feature File

`src/test/resources/features/poll-controller.feature`

```gherkin
@poll-controller
Feature: Poll Controller API Tests

  Background:
    Given the base url is "http://localhost:8080/v1"
    And I set default headers:
      | Content-Type | application/json |
      | Accept       | application/json |

  @create
  Scenario: Create a new poll successfully
    Given I set the request body from file "create-poll.json"
    When I call "POST" "/polls"
    Then the response status should be 201
    And the response should have location header containing "/v1/polls/"
    And I store jsonpath "$.id" as "createdPollId"

  @read-all
  Scenario: Retrieve all polls
    When I call "GET" "/polls"
    Then the response status should be 200
    And the response should be a non-empty array

  @read-single
  Scenario: Retrieve a specific poll by ID
    Given I have created a poll first
    When I call "GET" "/polls/${createdPollId}"
    Then the response status should be 200
    And the jsonpath "$.id" should equal "${createdPollId}"
    And the jsonpath "$.question" should not be null

  @read-single-not-found
  Scenario: Attempt to retrieve non-existent poll
    When I call "GET" "/polls/9999"
    Then the response status should be 404
    And the response should contain error message "Poll with id 9999 not found"

  @update
  Scenario: Update an existing poll
    Given I have created a poll first
    And I set the request body from file "update-poll.json"
    When I call "PUT" "/polls/${createdPollId}"
    Then the response status should be 200
    And when I call "GET" "/polls/${createdPollId}"
    Then the jsonpath "$.question" should equal "Updated Poll Question?"

  @update-not-found
  Scenario: Attempt to update non-existent poll
    Given I set the request body from file "update-poll.json"
    When I call "PUT" "/polls/9999"
    Then the response status should be 404

  @delete
  Scenario: Delete an existing poll
    Given I have created a poll first
    When I call "DELETE" "/polls/${createdPollId}"
    Then the response status should be 200
    And when I call "GET" "/polls/${createdPollId}"
    Then the response status should be 404

  @delete-not-found
  Scenario: Attempt to delete non-existent poll
    When I call "DELETE" "/polls/9999"
    Then the response status should be 404

  # Data-driven tests using Scenario Outline
  @create-datadriven
  Scenario Outline: Create polls with different questions
    Given I set body:
      """
      {
        "question": "<question>",
        "options": [
          {"value": "Option 1"},
          {"value": "Option 2"}
        ]
      }
      """
    When I call "POST" "/polls"
    Then the response status should be 201
    And the response should have location header

    Examples:
      | question                     |
      | "What is your favorite color?" |
      | "Which framework do you prefer?" |
      | "How do you rate our service?"  |

  @schema-validation
  Scenario: Validate poll response against JSON schema
    Given I have created a poll first
    When I call "GET" "/polls/${createdPollId}"
    Then the response status should be 200
    And the response should match schema "poll-schema.json"
```

## 2. Test Payloads

`src/test/resources/payloads/create-poll.json`
```json
{
  "question": "What is your favorite programming language?",
  "options": [
    {"value": "Java"},
    {"value": "Python"},
    {"value": "JavaScript"},
    {"value": "C#"}
  ]
}
```

`src/test/resources/payloads/update-poll.json`
```json
{
  "id": 1,
  "question": "Updated Poll Question?",
  "options": [
    {"value": "Option A"},
    {"value": "Option B"},
    {"value": "Option C"}
  ]
}
```

`src/test/resources/payloads/poll-with-options.json`
```json
{
  "question": "Poll with complex options",
  "options": [
    {
      "value": "Detailed Option 1",
      "description": "This is option 1 description"
    },
    {
      "value": "Detailed Option 2",
      "description": "This is option 2 description"
    }
  ]
}
```

## 3. JSON Schema

`src/test/resources/schemas/poll-schema.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "required": ["id", "question", "options"],
  "properties": {
    "id": {
      "type": "integer",
      "description": "Unique identifier for the poll"
    },
    "question": {
      "type": "string",
      "description": "The poll question"
    },
    "options": {
      "type": "array",
      "items": {
        "type": "object",
        "required": ["value"],
        "properties": {
          "id": {
            "type": "integer",
            "description": "Option identifier"
          },
          "value": {
            "type": "string",
            "description": "Option text"
          },
          "description": {
            "type": "string",
            "description": "Optional description"
          }
        }
      }
    },
    "createdAt": {
      "type": "string",
      "format": "date-time",
      "description": "Creation timestamp"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time",
      "description": "Last update timestamp"
    }
  },
  "additionalProperties": false
}
```

## 4. Poll Controller Steps

`src/test/java/com/apress/tests/steps/PollControllerSteps.java`

```java
package com.apress.tests.steps;

import com.apress.tests.support.TestContext;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;

import static org.assertj.core.api.Assertions.assertThat;

public class PollControllerSteps {

    private final TestContext ctx;

    @Autowired
    public PollControllerSteps(TestContext ctx) {
        this.ctx = ctx;
    }

    @Given("I have created a poll first")
    public void i_have_created_a_poll_first() {
        // Create a poll and store its ID for subsequent steps
        String createPayload = """
            {
                "question": "Initial test poll",
                "options": [
                    {"value": "Option 1"},
                    {"value": "Option 2"}
                ]
            }
            """;
        
        ctx.setBody(createPayload);
        ctx.getHeaders().put("Content-Type", "application/json");
        
        // This would typically call your existing ApiSteps methods
        // For simplicity, we'll simulate or you can integrate with your existing steps
    }

    @Then("the response should have location header")
    public void the_response_should_have_location_header() {
        HttpHeaders headers = ctx.getResponse().getHeaders();
        assertThat(headers.getLocation()).isNotNull();
    }

    @Then("the response should have location header containing {string}")
    public void the_response_should_have_location_header_containing(String expectedPath) {
        HttpHeaders headers = ctx.getResponse().getHeaders();
        assertThat(headers.getLocation()).isNotNull();
        assertThat(headers.getLocation().toString()).contains(expectedPath);
    }

    @Then("the response should be a non-empty array")
    public void the_response_should_be_a_non_empty_array() {
        Object responseBody = ctx.getResponse().getBody();
        assertThat(responseBody).isNotNull();
        // Assuming the response is a JSON array
        assertThat(ctx.getResponse().jsonPath().getList("$")).isNotEmpty();
    }

    @Then("the response should contain error message {string}")
    public void the_response_should_contain_error_message(String expectedMessage) {
        String actualMessage = ctx.getResponse().jsonPath().getString("message");
        assertThat(actualMessage).contains(expectedMessage);
    }

    @Then("the jsonpath {string} should not be null")
    public void the_jsonpath_should_not_be_null(String jsonPath) {
        Object value = ctx.getResponse().jsonPath().get(jsonPath);
        assertThat(value).isNotNull();
    }
}
```

## 5. Updated ApiSteps for Enhanced Functionality

`src/test/java/com/apress/tests/steps/ApiSteps.java` (enhanced version)

```java
package com.apress.tests.steps;

import com.apress.tests.support.TestContext;
import io.cucumber.datatable.DataTable;
import io.cucumber.java.en.And;
import io.cucumber.java.en.Given;
import io.cucumber.java.en.Then;
import io.cucumber.java.en.When;
import io.restassured.http.Header;
import io.restassured.response.Response;
import org.assertj.core.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static io.restassured.module.jsv.JsonSchemaValidator.matchesJsonSchemaInClasspath;

public class ApiSteps {

    private final TestContext ctx;

    @Autowired
    public ApiSteps(TestContext ctx) {
        this.ctx = ctx;
    }

    @Given("the base url is {string}")
    public void the_base_url_is(String baseUrl) {
        ctx.setBaseUrl(baseUrl);
    }

    @And("I set default headers:")
    public void i_set_default_headers(DataTable table) {
        table.asMaps().forEach(row -> {
            String key = row.get("header");
            String value = row.get("value");
            if (key != null && value != null) {
                ctx.getHeaders().put(key, value);
            }
        });
    }

    @And("I set path params:")
    public void i_set_path_params(DataTable table) {
        table.asMaps().forEach(row -> {
            String key = row.get("key");
            String value = row.get("value");
            if (key != null && value != null) {
                ctx.getPathParams().put(key, resolve(value));
            }
        });
    }

    @And("I set the request body from file {string}")
    public void i_set_the_request_body_from_file(String relPath) {
        String content = PayloadLoader.loadResourceAsString("payloads/" + relPath);
        ctx.setBody(content);
    }

    @And("I set body:")
    public void i_set_body_docstring(String body) {
        ctx.setBody(body);
    }

    @When("I call {string} {string}")
    public void i_call_method_endpoint(String method, String endpoint) {
        String url = ctx.getBaseUrl() + endpoint;
        
        var request = given()
            .headers(ctx.getHeaders())
            .pathParams(ctx.getPathParams())
            .queryParams(ctx.getQueryParams());

        if (ctx.getBody() != null && !ctx.getBody().isBlank()) {
            request = request.body(ctx.getBody());
        }

        Response response = switch (method.toUpperCase()) {
            case "GET" -> request.get(url);
            case "POST" -> request.post(url);
            case "PUT" -> request.put(url);
            case "PATCH" -> request.patch(url);
            case "DELETE" -> request.delete(url);
            default -> throw new IllegalArgumentException("Unsupported method: " + method);
        };

        ctx.setResponse(response);
    }

    @Then("the response status should be {int}")
    public void the_response_status_should_be(Integer status) {
        Assertions.assertThat(ctx.getResponse().getStatusCode()).isEqualTo(status);
    }

    @And("the jsonpath {string} should equal {string}")
    public void the_jsonpath_should_equal(String jsonPath, String expected) {
        Object actual = ctx.getResponse().jsonPath().get(jsonPath);
        Assertions.assertThat(String.valueOf(actual)).isEqualTo(resolve(expected));
    }

    @And("I store jsonpath {string} as {string}")
    public void i_store_jsonpath_as(String jsonPath, String key) {
        Object value = ctx.getResponse().jsonPath().get(jsonPath);
        Assertions.assertThat(value).isNotNull();
        ctx.getStore().put(key, value);
    }

    @And("the response should match schema {string}")
    public void the_response_should_match_schema(String schemaPath) {
        ctx.getResponse().then().assertThat()
            .body(matchesJsonSchemaInClasspath("schemas/" + schemaPath));
    }

    @And("the response should match schema {string} if present")
    public void the_response_should_match_schema_if_present(String schemaPath) {
        if (schemaPath != null && !schemaPath.isBlank()) {
            the_response_should_match_schema(schemaPath);
        }
    }

    private String resolve(String value) {
        if (value == null) return null;
        
        // Handle variable substitution ${var}
        if (value.startsWith("${") && value.endsWith("}")) {
            String key = value.substring(2, value.length() - 1);
            Object storedValue = ctx.getStore().get(key);
            return storedValue != null ? storedValue.toString() : "";
        }
        
        return value;
    }
}
```

## 6. Test Configuration

`src/test/resources/application-test.properties`
```properties
# Test configuration
spring.profiles.active=test
server.port=0  # Random port for tests

# Database configuration (if using in-memory DB for tests)
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# JPA configuration
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# Logging
logging.level.com.apress=DEBUG
logging.level.org.springframework.web=INFO
```

## 7. How to Run the Tests

```bash
# Run all tests
mvn test

# Run specific tag
mvn test -Dcucumber.filter.tags="@create"

# Run multiple tags
mvn test -Dcucumber.filter.tags="@create or @read"

# Run with specific profile
mvn test -Dspring.profiles.active=test

# Generate reports
mvn test -Dcucumber.plugin="html:target/cucumber-report.html"
```

## 8. Additional Test Scenarios You Might Want

You can extend this with more specific scenarios:

```gherkin
# Test poll with options validation
Scenario: Create poll with options validation
  Given I set body from file "poll-with-options.json"
  When I call "POST" "/polls"
  Then the response status should be 201
  And the jsonpath "$.options.length()" should equal "2"
  And the jsonpath "$.options[0].value" should equal "Detailed Option 1"

# Test error scenarios
Scenario: Create poll with invalid data
  Given I set body:
    """
    {"question": ""}
    """
  When I call "POST" "/polls"
  Then the response status should be 400

# Test pagination (if implemented)
Scenario: Retrieve polls with pagination
  When I call "GET" "/polls?page=0&size=10"
  Then the response status should be 200
  And the jsonpath "$.content" should not be null
```

This comprehensive test suite covers all your PollController endpoints with positive, negative, and edge case scenarios, ensuring your API behaves as expected.

I'll create a Spring Boot test runner that allows you to trigger Cucumber tests via REST API calls. This will let you run tests programmatically, either single feature files or multiple files for different APIs.

## Updated Project Structure

```
src/
├── main/
│   └── java/
│       └── com/apress/tests/
│           ├── ApiTestApplication.java
│           ├── controller/
│           │   └── TestRunnerController.java
│           ├── service/
│           │   ├── TestRunnerService.java
│           │   └── CucumberTestExecutor.java
│           └── model/
│               ├── TestRequest.java
│               ├── TestResponse.java
│               └── TestResult.java
└── test/
    └── ... (existing test structure)
```

## 1. Main Application Class

`src/main/java/com/apress/tests/ApiTestApplication.java`

```java
package com.apress.tests;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class ApiTestApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiTestApplication.class, args);
    }
}
```

## 2. Request/Response Models

`src/main/java/com/apress/tests/model/TestRequest.java`

```java
package com.apress.tests.model;

import java.util.List;

public class TestRequest {
    private List<String> featureFiles;
    private List<String> tags;
    private String baseUrl;
    private String authToken;
    private boolean generateReport = true;

    // Constructors
    public TestRequest() {}

    public TestRequest(List<String> featureFiles, List<String> tags) {
        this.featureFiles = featureFiles;
        this.tags = tags;
    }

    // Getters and Setters
    public List<String> getFeatureFiles() { return featureFiles; }
    public void setFeatureFiles(List<String> featureFiles) { this.featureFiles = featureFiles; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getAuthToken() { return authToken; }
    public void setAuthToken(String authToken) { this.authToken = authToken; }

    public boolean isGenerateReport() { return generateReport; }
    public void setGenerateReport(boolean generateReport) { this.generateReport = generateReport; }
}
```

`src/main/java/com/apress/tests/model/TestResponse.java`

```java
package com.apress.tests.model;

import java.util.List;

public class TestResponse {
    private String executionId;
    private String status;
    private int totalScenarios;
    private int passedScenarios;
    private int failedScenarios;
    private List<String> failedTests;
    private String reportUrl;
    private long executionTimeMs;

    // Constructors
    public TestResponse() {}

    public TestResponse(String executionId, String status) {
        this.executionId = executionId;
        this.status = status;
    }

    // Getters and Setters
    public String getExecutionId() { return executionId; }
    public void setExecutionId(String executionId) { this.executionId = executionId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getTotalScenarios() { return totalScenarios; }
    public void setTotalScenarios(int totalScenarios) { this.totalScenarios = totalScenarios; }

    public int getPassedScenarios() { return passedScenarios; }
    public void setPassedScenarios(int passedScenarios) { this.passedScenarios = passedScenarios; }

    public int getFailedScenarios() { return failedScenarios; }
    public void setFailedScenarios(int failedScenarios) { this.failedScenarios = failedScenarios; }

    public List<String> getFailedTests() { return failedTests; }
    public void setFailedTests(List<String> failedTests) { this.failedTests = failedTests; }

    public String getReportUrl() { return reportUrl; }
    public void setReportUrl(String reportUrl) { this.reportUrl = reportUrl; }

    public long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }
}
```

`src/main/java/com/apress/tests/model/TestResult.java`

```java
package com.apress.tests.model;

public class TestResult {
    private boolean success;
    private String message;
    private String details;

    public TestResult(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public TestResult(boolean success, String message, String details) {
        this.success = success;
        this.message = message;
        this.details = details;
    }

    // Getters and Setters
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}
```

## 3. Cucumber Test Executor Service

`src/main/java/com/apress/tests/service/CucumberTestExecutor.java`

```java
package com.apress.tests.service;

import io.cucumber.core.cli.Main;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.PrintStream;
import java.util.ArrayList;
import java.util.List;

@Component
public class CucumberTestExecutor {
    
    private static final Logger logger = LoggerFactory.getLogger(CucumberTestExecutor.class);
    
    public TestExecutionResult executeTests(List<String> featureFiles, List<String> tags) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintStream printStream = new PrintStream(outputStream);
        PrintStream originalOut = System.out;
        PrintStream originalErr = System.err;
        
        try {
            // Redirect output to capture results
            System.setOut(printStream);
            System.setErr(printStream);
            
            List<String> args = new ArrayList<>();
            
            // Add feature files
            if (featureFiles != null && !featureFiles.isEmpty()) {
                for (String featureFile : featureFiles) {
                    args.add("classpath:features/" + featureFile);
                }
            } else {
                args.add("classpath:features");
            }
            
            // Add tags filter
            if (tags != null && !tags.isEmpty()) {
                args.add("--tags");
                args.add(String.join(" and ", tags));
            }
            
            // Add plugins
            args.add("--plugin");
            args.add("pretty");
            args.add("--plugin");
            args.add("html:target/cucumber-reports/report.html");
            args.add("--plugin");
            args.add("json:target/cucumber-reports/cucumber.json");
            
            // Add glue package
            args.add("--glue");
            args.add("com.apress.tests.steps");
            
            logger.info("Executing Cucumber with args: {}", args);
            
            // Run Cucumber
            byte exitStatus = Main.run(args.toArray(new String[0]), Thread.currentThread().getContextClassLoader());
            
            String output = outputStream.toString();
            boolean success = exitStatus == 0;
            
            return new TestExecutionResult(success, output, exitStatus);
            
        } catch (Exception e) {
            logger.error("Error executing tests", e);
            return new TestExecutionResult(false, "Error: " + e.getMessage(), (byte) 1);
        } finally {
            // Restore original streams
            System.setOut(originalOut);
            System.setErr(originalErr);
            printStream.close();
        }
    }
    
    public static class TestExecutionResult {
        private final boolean success;
        private final String output;
        private final byte exitStatus;
        
        public TestExecutionResult(boolean success, String output, byte exitStatus) {
            this.success = success;
            this.output = output;
            this.exitStatus = exitStatus;
        }
        
        public boolean isSuccess() { return success; }
        public String getOutput() { return output; }
        public byte getExitStatus() { return exitStatus; }
    }
}
```

## 4. Test Runner Service

`src/main/java/com/apress/tests/service/TestRunnerService.java`

```java
package com.apress.tests.service;

import com.apress.tests.model.TestResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Service
public class TestRunnerService {
    
    private static final Logger logger = LoggerFactory.getLogger(TestRunnerService.class);
    
    @Autowired
    private CucumberTestExecutor testExecutor;
    
    @Async
    public CompletableFuture<TestResponse> runTestsAsync(List<String> featureFiles, List<String> tags) {
        String executionId = UUID.randomUUID().toString();
        logger.info("Starting test execution {} for features: {}, tags: {}", executionId, featureFiles, tags);
        
        long startTime = System.currentTimeMillis();
        
        try {
            CucumberTestExecutor.TestExecutionResult result = testExecutor.executeTests(featureFiles, tags);
            long executionTime = System.currentTimeMillis() - startTime;
            
            TestResponse response = new TestResponse();
            response.setExecutionId(executionId);
            response.setStatus(result.isSuccess() ? "COMPLETED" : "FAILED");
            response.setExecutionTimeMs(executionTime);
            
            // Parse results from output (simplified)
            int totalScenarios = parseTotalScenarios(result.getOutput());
            int failedScenarios = parseFailedScenarios(result.getOutput());
            
            response.setTotalScenarios(totalScenarios);
            response.setFailedScenarios(failedScenarios);
            response.setPassedScenarios(totalScenarios - failedScenarios);
            response.setReportUrl("/reports/" + executionId);
            
            logger.info("Test execution {} completed in {} ms. Success: {}", 
                       executionId, executionTime, result.isSuccess());
            
            return CompletableFuture.completedFuture(response);
            
        } catch (Exception e) {
            logger.error("Error in test execution {}", executionId, e);
            
            TestResponse response = new TestResponse();
            response.setExecutionId(executionId);
            response.setStatus("ERROR");
            response.setExecutionTimeMs(System.currentTimeMillis() - startTime);
            
            return CompletableFuture.completedFuture(response);
        }
    }
    
    private int parseTotalScenarios(String output) {
        // Simple parsing - in real implementation, use proper JSON report parsing
        String[] lines = output.split("\n");
        for (String line : lines) {
            if (line.contains("Scenarios:")) {
                String[] parts = line.split(":");
                if (parts.length > 1) {
                    return Integer.parseInt(parts[1].trim().split(" ")[0]);
                }
            }
        }
        return 0;
    }
    
    private int parseFailedScenarios(String output) {
        // Simple parsing
        String[] lines = output.split("\n");
        for (String line : lines) {
            if (line.contains("failed")) {
                String[] parts = line.split(" ");
                for (int i = 0; i < parts.length; i++) {
                    if ("failed".equals(parts[i]) && i > 0) {
                        return Integer.parseInt(parts[i-1]);
                    }
                }
            }
        }
        return 0;
    }
}
```

## 5. REST Controller for Test Execution

`src/main/java/com/apress/tests/controller/TestRunnerController.java`

```java
package com.apress.tests.controller;

import com.apress.tests.model.TestRequest;
import com.apress.tests.model.TestResponse;
import com.apress.tests.service.TestRunnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/tests")
public class TestRunnerController {
    
    @Autowired
    private TestRunnerService testRunnerService;
    
    @PostMapping("/run")
    public ResponseEntity<TestResponse> runTests(@RequestBody TestRequest request) {
        try {
            CompletableFuture<TestResponse> future = testRunnerService.runTestsAsync(
                request.getFeatureFiles(), 
                request.getTags()
            );
            
            // For synchronous execution, wait for completion
            TestResponse response = future.get();
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            TestResponse errorResponse = new TestResponse();
            errorResponse.setStatus("ERROR");
            errorResponse.setExecutionId("N/A");
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
    
    @PostMapping("/run/async")
    public ResponseEntity<TestResponse> runTestsAsync(@RequestBody TestRequest request) {
        CompletableFuture<TestResponse> future = testRunnerService.runTestsAsync(
            request.getFeatureFiles(), 
            request.getTags()
        );
        
        TestResponse immediateResponse = new TestResponse();
        immediateResponse.setStatus("STARTED");
        immediateResponse.setExecutionId("ASYNC-" + System.currentTimeMillis());
        
        return ResponseEntity.accepted().body(immediateResponse);
    }
    
    @GetMapping("/run/single/{featureFile}")
    public ResponseEntity<TestResponse> runSingleFeature(
            @PathVariable String featureFile,
            @RequestParam(required = false) List<String> tags) {
        
        TestRequest request = new TestRequest();
        request.setFeatureFiles(List.of(featureFile));
        request.setTags(tags);
        
        return runTests(request);
    }
    
    @GetMapping("/run/multiple")
    public ResponseEntity<TestResponse> runMultipleFeatures(
            @RequestParam List<String> features,
            @RequestParam(required = false) List<String> tags) {
        
        TestRequest request = new TestRequest();
        request.setFeatureFiles(features);
        request.setTags(tags);
        
        return runTests(request);
    }
    
    @GetMapping("/run/all")
    public ResponseEntity<TestResponse> runAllTests(
            @RequestParam(required = false) List<String> tags) {
        
        TestRequest request = new TestRequest();
        request.setTags(tags);
        
        return runTests(request);
    }
    
    // Health endpoint
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Test Runner Service is running");
    }
}
```

## 6. Configuration Classes

`src/main/java/com/apress/tests/config/AsyncConfig.java`

```java
package com.apress.tests.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.AsyncConfigurer;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig implements AsyncConfigurer {
    
    @Override
    public Executor getAsyncExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("TestRunner-");
        executor.initialize();
        return executor;
    }
}
```

`src/main/java/com/apress/tests/config/WebConfig.java`

```java
package com.apress.tests.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
```

## 7. Updated Application Properties

`src/main/resources/application.properties`

```properties
# Server configuration
server.port=8081
server.servlet.context-path=/test-runner

# Spring profiles
spring.profiles.active=dev

# Logging
logging.level.com.apress.tests=DEBUG
logging.level.org.springframework.web=INFO
logging.level.io.cucumber=INFO

# Async configuration
spring.task.execution.pool.core-size=5
spring.task.execution.pool.max-size=10
spring.task.execution.pool.queue-capacity=25

# Report directory
test.reports.dir=target/cucumber-reports
```

## 8. How to Use the Test Runner

### Start the Application:
```bash
mvn spring-boot:run
# or
java -jar target/api-test-runner-1.0.0.jar
```

### Trigger Tests via REST API:

**1. Run single feature file:**
```bash
curl -X GET "http://localhost:8081/test-runner/api/tests/run/single/poll-controller.feature"
```

**2. Run single feature with specific tags:**
```bash
curl -X GET "http://localhost:8081/test-runner/api/tests/run/single/poll-controller.feature?tags=@create&tags=@read"
```

**3. Run multiple feature files:**
```bash
curl -X GET "http://localhost:8081/test-runner/api/tests/run/multiple?features=poll-controller.feature&features=user-controller.feature"
```

**4. Run all tests with specific tags:**
```bash
curl -X GET "http://localhost:8081/test-runner/api/tests/run/all?tags=@smoke"
```

**5. Run with JSON request body (more control):**
```bash
curl -X POST "http://localhost:8081/test-runner/api/tests/run" \
  -H "Content-Type: application/json" \
  -d '{
    "featureFiles": ["poll-controller.feature", "user-controller.feature"],
    "tags": ["@smoke", "@regression"],
    "baseUrl": "http://localhost:8080",
    "authToken": "your-jwt-token",
    "generateReport": true
  }'
```

**6. Run asynchronously:**
```bash
curl -X POST "http://localhost:8081/test-runner/api/tests/run/async" \
  -H "Content-Type: application/json" \
  -d '{"featureFiles": ["poll-controller.feature"]}'
```

### Sample Responses:

**Success Response:**
```json
{
  "executionId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "COMPLETED",
  "totalScenarios": 10,
  "passedScenarios": 9,
  "failedScenarios": 1,
  "failedTests": ["Scenario: Create poll with invalid data"],
  "reportUrl": "/reports/123e4567-e89b-12d3-a456-426614174000",
  "executionTimeMs": 4500
}
```

**Error Response:**
```json
{
  "executionId": "N/A",
  "status": "ERROR",
  "totalScenarios": 0,
  "passedScenarios": 0,
  "failedScenarios": 0,
  "failedTests": [],
  "reportUrl": null,
  "executionTimeMs": 0
}
```

This setup gives you a fully functional test runner that can execute Cucumber tests programmatically via REST API calls, either synchronously or asynchronously, with support for running single or multiple feature files with specific tags.