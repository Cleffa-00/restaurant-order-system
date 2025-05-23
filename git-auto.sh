#!/bin/bash

# 自动 Git 提交脚本
# 使用方法：./git-auto.sh "你的提交信息"

# 获取提交信息参数
message="$1"

# 如果没有传提交信息，使用默认信息
if [ -z "$message" ]; then
  message="Auto commit on $(date '+%Y-%m-%d %H:%M:%S')"
fi

# 执行 git 操作
git add .
git commit -m "$message"
git push

echo "✅ Git push completed with message: $message"
