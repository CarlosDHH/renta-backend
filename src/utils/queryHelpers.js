export const paginate = (page = 1, limit = 20) => ({
  skip: (Number(page) - 1) * Number(limit),
  take: Number(limit),
})

export const paginatedResponse = (data, total, page, limit) => ({
  data,
  meta: {
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.ceil(total / Number(limit)),
  },
})