<template>
    <div class="wrap" id="app2">
        <div class="loginBox">
            <el-form ref="loginForm" :model="loginForm" class="login-form" :rules="rules" label-width="80px"
                     label-position="left">
                <el-row gutter="80" justify="start">
                    <el-col span="24">
                         <el-form-item label="用户名" prop="name">
                              <el-input v-model="loginForm.name"></el-input>
                         </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="24">
                          <el-form-item label="密码" prop="password">
                                <el-input v-model="loginForm.password" type="password"></el-input>
                          </el-form-item>
                    </el-col>
                </el-row>
                <el-row gutter="80" justify="start">
                    <el-col span="24">
                          <el-form-item>
                               <el-button type="primary" plain @click="handleLogin">登录</el-button>
                         </el-form-item>
                    </el-col>
                </el-row>
            </el-form>
        </div>
    </div>

</template>

<script>
    export default {
        name: "Login",
        data() {
            return {
                loginForm: {},
                rules: {
                    name: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ]
                }
            };
        },
        created() {
            this.openTip();
        },
        methods: {
            handleLogin() {
                let url = '/api/user/login?userName=' + this.loginForm.name + '&userPass=' + this.loginForm.password;
                this.$refs['loginForm'].validate((valid) => {
                    if (valid) {
                        this.$http.post(url, {}).then(({body}) => {
                            if (body.errorCode === 200) {
                                sessionStorage.username = body.data.userName;
                                window.location.href = "/chart";
                            } else {
                                this.$message.error(body.errorMsg);
                            }

                        }).catch((err) => {
                            console.log(err)
                            this.$message.error('登陆失败')
                        })
                    }
                })


            },
        }
    }
</script>
<style src="../../../style/common.scss">

</style>
<style scoped lang="scss">

    .wrap {
        width: 100%;
        height: 100%;
        background: url("../../../assets/img/bg.jpeg") no-repeat;
        background-size: 100% 100%;

        .loginBox {
            width: 355px;
            height: 232px;
            padding: 40px;
            position: absolute;
            left: 0;
            top: 0;
            right: 0;
            bottom: 0;
            margin: auto;
            background: white;
            text-align: center;
            box-shadow: 1px 2px 1px rgba(0, 0, 0, .15);
            padding-top: 31px;

            .el-form {
                margin-top: 30px;

                .el-button {
                    width: 100%;
                }
            }
        }
    }
</style>
