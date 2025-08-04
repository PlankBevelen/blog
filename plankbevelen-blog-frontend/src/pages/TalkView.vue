<template>
    <TopBanner :imagePath="imagePath" :title="title" height="35vh" />
    <div class="talk">
        <div class="container">
            <div class="left-side">            
                <el-row class="statistics-box card">
                    <el-col :span="8" class="statistic-item">
                        <el-statistic title="说说" :value="outputTalkCount" />
                    </el-col>
                    <el-col :span="8" class="statistic-item">
                        <el-statistic title="照片" :value="outputPhotoCount" />
                    </el-col>
                    <el-col :span="8" class="statistic-item">
                        <el-statistic title="评论" :value="outputCommentCount" />
                    </el-col>
                </el-row>
                <el-row class="info-box card">
                    <el-col :span="24" class="box-item">
                        <svg-icon name="about1" size="1.25em"/>
                        <span>该页面用于发行日常说说. 记录生活点滴，与大家交流心得。欢迎大家前来浏览！</span>
                    </el-col>
                    <el-col :span="24" class="box-item">
                        <svg-icon name="about2" size="1.3em"/>
                        <span>浪漫至死不渝.</span>
                    </el-col>
                    <el-col :span="24" class="box-item">
                        <svg-icon name="about3" size="1.25em"/>
                        <span>广东 深圳.</span>
                    </el-col>
                    <el-col :span="24" class="box-item">
                        <svg-icon name="about4" size="1.25em"/>
                        <span>无业游民.</span>
                    </el-col>
                </el-row>
            </div>

            <div class="talk-list">
                <!-- <TalkCard 
                    v-for="item in paginatedTalks" 
                    :key="item.id" 
                    :item="item" 
                />
                <div class="pagination">
                    <el-pagination
                        v-model:current-page="curPage"
                        :page-size="pageSize"
                        :total="totalCount"
                        layout="total, prev, pager, next, jumper"
                        @current-change="handlePageChange"
                    >
                    </el-pagination>
                </div> -->
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue'
import talkImage from '@/assets/images/talk.jpg'
import { ref, onMounted } from 'vue'
import { useTransition } from '@vueuse/core'

const imagePath = talkImage;    
const title = '说说'

const talkCount = ref(0)
const outputTalkCount = useTransition(talkCount, { duration : 2 * 1000 })
const photoCount = ref(0)
const outputPhotoCount = useTransition(photoCount, { duration : 2 * 1000 })
const commentCount = ref(0)
const outputCommentCount = useTransition(commentCount, { duration : 2 * 1000 })

onMounted(()=>{
    setTimeout(()=>{
        talkCount.value = 201
        photoCount.value = 101
        commentCount.value = 201
    })
})

</script>

<style lang="less" scoped  src="@/assets/styles/pages/talk.less">
</style>
