
export type Constraint = Partial<ConstraintFull>;
interface ConstraintFull {
    name: string,
    email: boolean,
    equality: string | null,
    length: Partial<{
        tooShort: string,
        tooLong: string,
        minimum: number | null,
        maximum: number | null,
    }>,
    format: Partial<{
        pattern: string | null,
        message: string,
    }>,
    presence: boolean,
}

export interface RealConstraints {
    [key: string]: Constraint
}