import { notFound } from 'next/navigation'
import {
  getCluster,
  getClusterAssets,
  calculateCoverageScore,
  getAllAssetOptions,
} from '@/lib/queries/clusters'
import { ClusterDetail } from '@/components/clusters/ClusterDetail'

export default async function ClusterDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { id } = params

  const [cluster, clusterAssets, allAssets, coverageScore] = await Promise.all([
    getCluster(id),
    getClusterAssets(id),
    getAllAssetOptions(),
    calculateCoverageScore(id),
  ])

  if (!cluster) {
    notFound()
  }

  return (
    <ClusterDetail
      cluster={cluster}
      clusterAssets={clusterAssets}
      allAssets={allAssets}
      coverageScore={coverageScore}
    />
  )
}
