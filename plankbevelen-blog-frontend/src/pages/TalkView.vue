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
                <div v-if="talkStore.loading" class="loading">
                    <el-skeleton v-for="n in 3" :key="n" animated>
                        <template #template>
                            <div class="skeleton-talk">
                                <el-skeleton-item variant="circle" style="width: 40px; height: 40px;" />
                                <div style="margin-left: 16px; flex: 1;">
                                    <el-skeleton-item variant="text" style="width: 30%; margin-bottom: 8px;" />
                                    <el-skeleton-item variant="text" style="width: 80%;" />
                                    <el-skeleton-item variant="text" style="width: 60%;" />
                                </div>
                            </div>
                        </template>
                    </el-skeleton>
                </div>
                
                <div v-else-if="talks.length === 0" class="empty-state">
                    <svg-icon name="talk" size="4em" />
                    <p>还没有发布任何说说</p>
                </div>
                
                <div v-else class="talks-container">
                    <TalkCard 
                        v-for="talk in paginatedTalks" 
                        :key="talk.id" 
                        :talk="talk" 
                        @comment-count-changed="handleCommentCountChange"
                    />
                    
                    <div v-if="totalCount > pageSize" class="pagination">
                        <el-pagination
                            v-model:current-page="curPage"
                            :page-size="pageSize"
                            :total="totalCount"
                            layout="total, prev, pager, next, jumper"
                            @current-change="handlePageChange"
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import TopBanner from '@/components/TopBanner.vue'
import TalkCard from '@/components/talk/TalkCard.vue'
import talkImage from '@/assets/images/talk.jpg'
import { ref, onMounted, computed } from 'vue'
import { useTransition } from '@vueuse/core'
import type { TalkEntity } from '@/types/talk'
import { ElMessage } from 'element-plus'
import { useTalkStore } from '@/stores/talk'

const imagePath = talkImage;    
const title = '说说'

// 使用talk store
const talkStore = useTalkStore()

// 数据状态
const talks = ref<TalkEntity[]>([])
const curPage = ref(1)
const pageSize = ref(10)
const totalCount = ref(0)

// 统计数据
const talkCount = ref(0)
const outputTalkCount = useTransition(talkCount, { duration : 1 * 1000 })
const photoCount = ref(0)
const outputPhotoCount = useTransition(photoCount, { duration : 1 * 1000 })
const commentCount = ref(0)
const outputCommentCount = useTransition(commentCount, { duration : 1 * 1000 })

// 分页数据
const paginatedTalks = computed(() => {
  const start = (curPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return talks.value.slice(start, end)
})

// 获取已发布的说说
const fetchPublishedTalks = async () => {
  try {
    const data = await talkStore.fetchPublishedTalks()
    talks.value = data || []
    totalCount.value = talks.value.length
    
    // 更新统计数据
    talkCount.value = talks.value.length
    photoCount.value = talks.value.reduce((count, talk) => count + (talk.images?.length || 0), 0)
    commentCount.value = talks.value.reduce((count, talk) => count + (talk.comments_count || 0), 0)
  } catch (error) {
    console.error('获取说说失败:', error)
    ElMessage.error('获取说说失败')
  }
}

// 处理评论数量变化
const handleCommentCountChange = (oldCount: number, newCount: number) => {
  const diff = newCount - oldCount
  commentCount.value += diff
}

// 分页处理
const handlePageChange = (page: number) => {
  curPage.value = page
  // 滚动到顶部
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  fetchPublishedTalks()
})

</script>

<style lang="less" scoped  src="@/assets/styles/pages/talk.less">
</style>
