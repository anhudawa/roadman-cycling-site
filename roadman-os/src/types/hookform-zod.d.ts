declare module '@hookform/resolvers/zod' {
  import type { FieldValues, ResolverResult, ResolverOptions } from 'react-hook-form'
  import type { ZodSchema, ZodTypeDef } from 'zod'

  export function zodResolver<T extends ZodSchema<any, ZodTypeDef, any>>(
    schema: T,
    schemaOptions?: Partial<{ async: boolean; errorMap: any }>,
    factoryOptions?: { mode?: 'async' | 'sync'; raw?: boolean }
  ): <TFieldValues extends FieldValues, TContext>(
    values: TFieldValues,
    context: TContext | undefined,
    options: ResolverOptions<TFieldValues>
  ) => Promise<ResolverResult<TFieldValues>>
}
