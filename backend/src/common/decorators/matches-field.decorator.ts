import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

/**
 * Valida que el valor del campo decorado coincida exactamente con otro campo de la misma clase.
 * Usado en DTOs de contraseña para verificar que nuevaContrasena === confirmarContrasena.
 */
export function MatchesField(
  property: string,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'matchesField',
      target: object.constructor,
      propertyName,
      options: { message: `El campo no coincide con ${property}`, ...validationOptions },
      constraints: [property],
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          const [relatedPropertyName] = args.constraints as [string];
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName];
          return typeof value === 'string' && value === relatedValue;
        },
      },
    });
  };
}
