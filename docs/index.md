# API设计
## 获取列表（ GET /filelist）
返回数据库中的文件列表
* 输入：

  参数名     | 是否必需 | 描述
  ---------|:------:|------
  owner     |   否    | 当前登录用户，默认全部owner
  type      |   否    | [文件类型](https://zh.wikipedia.org/wiki/Category:%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)
  
* 输出：
    ```json
    [{
      "uuid":"uuid",
      "filename":"filename",
      "uploaded_by":"username",
      "size":0,
      "type":"type",
      "visibility":"public",
      "last_modify": "2017-04-05 17:50"
    }]
    ```
    
    参数名         | 描述
    -------------|----
    uuid          | 文件uuid
    filename      | 文件名
    size          | 文件大小，单位：字节<br>
    type          | [文件类型](https://zh.wikipedia.org/wiki/Category:%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)
    visibility    | 文件可见性，取值为“public”和“owner”
    uploaded_by   | 上传的人
    last_modify   | 最后修改
    
## 下载文件（GET /files/:uuid）
将加密文件解密到制定的cache中

* 输出：

     ```json
     {"uuid":"uuid","path":"path"}
     ```
     参数名 | 描述
     ------|-----
     uuid  | 文件标识
     path  | 文件缓存路径
  
## 上传文件（POST /files）
将cache中的文件加密到文件区中

* 输入：

  参数名      | 是否必需 | 描述
  ----------|:------:|------
  path       |   是    | 当前登录用户，默认全部owner
  type       |   否    | [文件类型](https://zh.wikipedia.org/wiki/Category:%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)
  visibility |   否    | 默认public
  uploaded_by|   是    | 上传者的uuid
  crypto     |   否    | 加密方式，默认rc4
  key        |   否    | 加密密码，没有的时候取默认密码
  
* 输出

   ```json
    [{
      "uuid":"uuid",
      "filename":"filename",
      "uploaded_by":"owner_uuid",
      "size":0,
      "type":"type",
      "visibility":"public",
      "last_modify": "2017-04-05 17:50"
    }]
    ```
    
    参数名         | 描述
    -------------|----
    uuid          | 文件uuid
    filename      | 文件名
    size          | 文件大小，单位KB<br>
    type          | [文件类型](https://zh.wikipedia.org/wiki/Category:%E6%96%87%E4%BB%B6%E6%A0%BC%E5%BC%8F)
    visibility    | 文件可见性，取值为“public”和“owner”
    uploaded_by   | 上传的人
    last_modify   | 最后修改

## 获取加密算法（get /cryptoes）
从算法库中获取算法

* 输出

    ```json
    ["aes-128-cbc","aes-128-cbc-hmac-sha1","aes-128-cbc-hmac-sha256","aes-128-ccm","aes-128-cfb","aes-128-cfb1","aes-128-cfb8","aes-128-ctr","aes-128-ecb","aes-128-gcm","aes-128-ofb","aes-128-xts","aes-192-cbc","aes-192-ccm","aes-192-cfb","aes-192-cfb1","aes-192-cfb8","aes-192-ctr","aes-192-ecb","aes-192-gcm","aes-192-ofb","aes-256-cbc","aes-256-cbc-hmac-sha1","aes-256-cbc-hmac-sha256","aes-256-ccm","aes-256-cfb","aes-256-cfb1","aes-256-cfb8","aes-256-ctr","aes-256-ecb","aes-256-gcm","aes-256-ofb","aes-256-xts","aes128","aes192","aes256","bf","bf-cbc","bf-cfb","bf-ecb","bf-ofb","blowfish","camellia-128-cbc","camellia-128-cfb","camellia-128-cfb1","camellia-128-cfb8","camellia-128-ecb","camellia-128-ofb","camellia-192-cbc","camellia-192-cfb","camellia-192-cfb1","camellia-192-cfb8","camellia-192-ecb","camellia-192-ofb","camellia-256-cbc","camellia-256-cfb","camellia-256-cfb1","camellia-256-cfb8","camellia-256-ecb","camellia-256-ofb","camellia128","camellia192","camellia256","cast","cast-cbc","cast5-cbc","cast5-cfb","cast5-ecb","cast5-ofb","des","des-cbc","des-cfb","des-cfb1","des-cfb8","des-ecb","des-ede","des-ede-cbc","des-ede-cfb","des-ede-ofb","des-ede3","des-ede3-cbc","des-ede3-cfb","des-ede3-cfb1","des-ede3-cfb8","des-ede3-ofb","des-ofb","des3","desx","desx-cbc","id-aes128-CCM","id-aes128-GCM","id-aes128-wrap","id-aes192-CCM","id-aes192-GCM","id-aes192-wrap","id-aes256-CCM","id-aes256-GCM","id-aes256-wrap","id-smime-alg-CMS3DESwrap","idea","idea-cbc","idea-cfb","idea-ecb","idea-ofb","rc2","rc2-40-cbc","rc2-64-cbc","rc2-cbc","rc2-cfb","rc2-ecb","rc2-ofb","rc4","rc4-40","rc4-hmac-md5","seed","seed-cbc","seed-cfb","seed-ecb","seed-ofb"]
    ```